"""
Night City flythrough (v3): a procedural, rain-soaked neon canyon rendered as a
short H.264 video that the /about-me arrival scrubs with scroll.

Everything is generated from code (no external assets apart from the OFL fonts
next to this file), so the look can be tweaked and re-rendered.

v3 look: a gloomy, dull city (wet grey-brown concrete, masonry, brutalist
slabs, grime, grey-teal smog) where all the colour comes from light: neon,
LED billboards, holograms, lamps, the train and their reflections. The street
is dense: a market strip with awnings and bulb strings, vending machines,
pedestrians (some under LED umbrellas), fire escapes, pipes, trash, steam,
cable webs and lantern strings, some low enough to pass right over the lens.

Each frame is two renders composited in post:

  * beauty  - the city in Cycles: wet road, neon, windows, holograms, traffic.
  * volume  - the same scene at low resolution with every surface rendered black
              and a height-falloff smog volume switched on, so it captures only the
              light scattered in the air: sign halos, lamp cones, searchlight beams,
              lit steam. Fog is low-frequency, so 1/4 resolution is plenty and it
              costs a fraction of rendering volumetrics in the beauty pass.

    # render both passes (PNG) for a sequence (desktop 240 frames, phones 180)
    python night_city_flythrough.py render --res desktop --frames 240 --pass beauty --out /tmp/nc/d/beauty
    python night_city_flythrough.py render --res desktop --frames 240 --pass volume --out /tmp/nc/d/volume

    # composite (volume, bloom, anamorphic streaks, chromatic aberration, the
    # dull-base grade, vignette, quiet text bands) to PNG frames
    python night_city_flythrough.py post --src /tmp/nc/d --dst /tmp/nc/d/post --size 1280x720 \
        --format png --poster client/public/nightcity/fly/poster.jpg

    # encode the frames to a scrubbable H.264 MP4 (a keyframe every 6 frames)
    python night_city_flythrough.py encode --src /tmp/nc/d/post --dst client/public/nightcity/fly/nc-desktop.mp4 --crf 24

    # look-dev: both passes + post for a few frames, into one folder
    python night_city_flythrough.py look --res desktop --frames 240 --frames-list 1,60,110,160,200,240 --out /tmp/nc/look

    # a single beauty still
    python night_city_flythrough.py still --res desktop --frames 240 --frame 60 --out /tmp/nc/still.png

`python` is any interpreter with the `bpy` module (pip install bpy), or run
inside Blender: blender -b -P night_city_flythrough.py -- render ...
--blend path.blend saves the generated scene (with the motion baked to
keyframes) so it can be opened in Blender's UI.

Scene layout (Blender units ~ metres): the avenue runs along +Y, the road is the
strip |x| < 7 at z = 0, towers line both sides, an elevated rail crosses at
y = 96, skybridges at y = 130 and 256, a low block with a giant screen sits at
y = 304, and the mega-tower closes the street at y ~ 350 with the NIGHT CITY sign.
The camera rises past the last towers' corners and terraces and crests the
skyline to face the sign.

Every moving thing (camera, train, flying cars, traffic, pedestrians, sign
flicker, hologram scanlines, billboard graphics, searchlights, rain, steam) is a
pure function of the frame number, so the sequence scrubs backwards cleanly.
Animation speeds are expressed in v2 "desktop frames" (120 over the shot), so
any frame count shows the same moments; more frames just mean finer steps.
"""

import argparse
import math
import os
import random
import sys
import time

import bpy
import bmesh  # only importable once bpy is loaded
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")
FONT_DISPLAY = "BarlowCondensed-ExtraBold.ttf"
FONT_SUB = "Rajdhani-Bold.ttf"


# --------------------------------------------------------------------------
# Palette (from client/src/index.css .theme-cyber). Blender wants linear RGB.
# --------------------------------------------------------------------------
def srgb(hexstr):
    hexstr = hexstr.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(hexstr[i:i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, 1.0)


RED_DEEP = srgb("#c2140c")
AMBER = srgb("#ffb347")      # warm window light
CYAN = srgb("#00f0ff")       # --nc-cyan: holograms only (rare accent)
WHITE_WARM = srgb("#ffe9c9")
COOL_WHITE = srgb("#bfe6ee")  # a few office floors, for colour contrast
# Emission versions of the neon colours. #ff3a2e has enough blue that a bright
# emitter clips to salmon/pink once red saturates; these keep blue << green so
# hot cores go red-orange instead.
NEON_RED = (1.0, 0.03, 0.006, 1.0)
NEON_YELLOW = (0.95, 0.72, 0.0, 1.0)       # --nc-yellow #f3e600, warmed so it reads in haze
HAZE = srgb("#18232a")                     # grey-teal smog: dull and cool, so the neon is the only colour

SIGN_WORDS = [
    # (text, colour key, style)  - words from lib/personal-data.ts
    # styles: blade (vertical, projecting), tube (outline glass on a board),
    #         box (filled letters on a lit panel), bulbs (marquee with chaser dots)
    ("SYNTHWAVE", "red", "blade"),
    ("GUITAR", "yellow", "blade"),
    ("PHONK", "red", "box"),
    ("ARCADE", "yellow", "bulbs"),
    ("SOULS", "red", "blade"),
    ("ANIME", "yellow", "blade"),
    ("RADIO", "red", "tube"),
    ("SCI-FI", "red", "box"),
    ("ROVER", "yellow", "blade"),
    ("OST", "cyan", "tube"),
    ("NOODLES", "yellow", "blade"),
    ("EDGERUNNER", "red", "blade"),
    ("SEKIRO", "red", "tube"),
    ("RAIN", "yellow", "box"),
]
FLICKER_WORDS = {"SOULS", "RADIO", "NOODLES", "RAIN"}


def args_from_cli():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else argv[1:]
    p = argparse.ArgumentParser()
    p.add_argument("mode", choices=["render", "still", "post", "look", "encode"])
    p.add_argument("--res", choices=["desktop", "mobile"], default="desktop")
    p.add_argument("--pass", dest="pass_", choices=["beauty", "volume"], default="beauty")
    p.add_argument("--frames", type=int, default=240)
    p.add_argument("--format", choices=["png", "webp"], default="png", help="post output format")
    p.add_argument("--crf", type=int, default=24, help="encode: x264 constant rate factor")
    p.add_argument("--fps", type=int, default=30, help="encode: frame rate")
    p.add_argument("--gop", type=int, default=6, help="encode: keyframe interval (small = smooth scrubbing)")
    p.add_argument("--frame", type=int, default=1)
    p.add_argument("--frames-list", default="1,60,110,160,200,240")
    p.add_argument("--start", type=int, default=1)
    p.add_argument("--end", type=int, default=0)
    p.add_argument("--out", default="/tmp/nc")
    p.add_argument("--samples", type=int, default=0, help="0 = pass default")
    p.add_argument("--scale", type=int, default=75, help="beauty resolution percentage")
    p.add_argument("--blend", default="")
    p.add_argument("--src", default="")
    p.add_argument("--dst", default="")
    p.add_argument("--quality", type=int, default=66)
    p.add_argument("--poster", default="")
    p.add_argument("--size", default="", help="WxH output size for post (e.g. 1280x720)")
    p.add_argument("--vol-gain", type=float, default=0.8)
    return p.parse_args(argv)


# --------------------------------------------------------------------------
# Small helpers
# --------------------------------------------------------------------------
def reset_scene():
    global _UNIT_CUBE
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _UNIT_CUBE = None  # the factory reset freed it
    _FONTS.clear()
    scene = bpy.context.scene
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)
    return scene


def link(obj, coll=None):
    (coll or bpy.context.scene.collection).objects.link(obj)
    return obj


_UNIT_CUBE = None


def unit_cube():
    """One shared 1x1x1 cube mesh (origin at the bottom centre); objects scale it."""
    global _UNIT_CUBE
    if _UNIT_CUBE is None:
        me = bpy.data.meshes.new("unit_cube")
        v = [(-0.5, -0.5, 0), (0.5, -0.5, 0), (0.5, 0.5, 0), (-0.5, 0.5, 0),
             (-0.5, -0.5, 1), (0.5, -0.5, 1), (0.5, 0.5, 1), (-0.5, 0.5, 1)]
        f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
        me.from_pydata(v, [], f)
        me.update()
        _UNIT_CUBE = me
    return _UNIT_CUBE


def box(name, loc, size, mat, coll=None):
    ob = bpy.data.objects.new(name, unit_cube())
    ob.location = loc
    ob.scale = size
    if mat:
        if not ob.data.materials:
            ob.data.materials.append(mat)
        ob.material_slots[0].link = "OBJECT"
        ob.material_slots[0].material = mat
    return link(ob, coll)


def plane(name, loc, size_xy, rot, mat, coll=None):
    me = bpy.data.meshes.new(name)
    sx, sy = size_xy[0] / 2, size_xy[1] / 2
    me.from_pydata([(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [], [(0, 1, 2, 3)])
    me.uv_layers.new()
    me.uv_layers[0].data[0].uv = (0, 0)
    me.uv_layers[0].data[1].uv = (1, 0)
    me.uv_layers[0].data[2].uv = (1, 1)
    me.uv_layers[0].data[3].uv = (0, 1)
    me.update()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = rot
    return link(ob, coll)


def instance(name, mesh, mat, coll=None):
    """An object sharing `mesh`, with its own (object-linked) material."""
    if not mesh.materials:
        mesh.materials.append(mat)
    ob = bpy.data.objects.new(name, mesh)
    ob.material_slots[0].link = "OBJECT"
    ob.material_slots[0].material = mat
    return link(ob, coll)


class BoxBatch:
    """Many small boxes merged into one mesh (greebles, ledges, LED strips).
    One object per batch keeps scene setup fast with thousands of parts."""

    def __init__(self):
        self.v, self.f = [], []

    def add(self, cx, cy, z0, sx, sy, sz):
        b = len(self.v)
        x0, x1, y0, y1, z1 = cx - sx / 2, cx + sx / 2, cy - sy / 2, cy + sy / 2, z0 + sz
        self.v += [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
                   (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)]
        self.f += [(b, b + 3, b + 2, b + 1), (b + 4, b + 5, b + 6, b + 7), (b, b + 1, b + 5, b + 4),
                   (b + 1, b + 2, b + 6, b + 5), (b + 2, b + 3, b + 7, b + 6), (b + 3, b, b + 4, b + 7)]

    def build(self, name, mat, coll):
        me = bpy.data.meshes.new(name)
        me.from_pydata(self.v, [], self.f)
        me.update()
        me.materials.append(mat)
        return link(bpy.data.objects.new(name, me), coll)


# --------------------------------------------------------------------------
# Materials.
#
# Every surface ends in the shared "pass switch" group: in the volume pass a
# single value inside the group turns all surfaces black (they still occlude
# light and the camera, so the fog gets proper shafts and shadows).
#
# Every surface also gets cheap distance haze: a mix toward a cool teal
# emission by camera distance (denser near the ground). It layers the depth,
# fogs what the wet road reflects, and is the cool counterpoint to the neon.
# --------------------------------------------------------------------------
_PASS_GROUP = None


def pass_group():
    global _PASS_GROUP
    if _PASS_GROUP is not None:
        return _PASS_GROUP
    g = bpy.data.node_groups.new("PassSwitch", "ShaderNodeTree")
    g.interface.new_socket("Shader", in_out="INPUT", socket_type="NodeSocketShader")
    g.interface.new_socket("Shader", in_out="OUTPUT", socket_type="NodeSocketShader")
    gi = g.nodes.new("NodeGroupInput")
    go = g.nodes.new("NodeGroupOutput")
    val = g.nodes.new("ShaderNodeValue")
    val.name = "volume_pass"
    val.outputs[0].default_value = 0.0
    black = g.nodes.new("ShaderNodeEmission")
    black.inputs["Color"].default_value = (0, 0, 0, 1)
    black.inputs["Strength"].default_value = 0.0
    mix = g.nodes.new("ShaderNodeMixShader")
    g.links.new(val.outputs[0], mix.inputs[0])
    g.links.new(gi.outputs[0], mix.inputs[1])
    g.links.new(black.outputs[0], mix.inputs[2])
    g.links.new(mix.outputs[0], go.inputs[0])
    _PASS_GROUP = g
    return g


def finish(nt, shader_socket, out):
    grp = nt.nodes.new("ShaderNodeGroup")
    grp.node_tree = pass_group()
    nt.links.new(shader_socket, grp.inputs[0])
    nt.links.new(grp.outputs[0], out.inputs["Surface"])


def add_haze(nt, surface_socket, density=0.0062, strength=0.5):
    n, l = nt.nodes, nt.links
    cam = n.new("ShaderNodeCameraData")
    geo = n.new("ShaderNodeNewGeometry")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(geo.outputs["Position"], sep.inputs[0])
    # height term: 1 + 2 * exp(-z / 28)
    hz = n.new("ShaderNodeMath"); hz.operation = "MULTIPLY"; hz.inputs[1].default_value = -1 / 28
    l.new(sep.outputs["Z"], hz.inputs[0])
    he = n.new("ShaderNodeMath"); he.operation = "EXPONENT"
    l.new(hz.outputs[0], he.inputs[0])
    hm = n.new("ShaderNodeMath"); hm.operation = "MULTIPLY_ADD"
    hm.inputs[1].default_value = 2.0; hm.inputs[2].default_value = 1.0
    l.new(he.outputs[0], hm.inputs[0])
    d1 = n.new("ShaderNodeMath"); d1.operation = "MULTIPLY"; d1.inputs[1].default_value = -density
    l.new(cam.outputs["View Distance"], d1.inputs[0])
    d2 = n.new("ShaderNodeMath"); d2.operation = "MULTIPLY"
    l.new(d1.outputs[0], d2.inputs[0]); l.new(hm.outputs[0], d2.inputs[1])
    ex = n.new("ShaderNodeMath"); ex.operation = "EXPONENT"
    l.new(d2.outputs[0], ex.inputs[0])
    fac = n.new("ShaderNodeMath"); fac.operation = "SUBTRACT"; fac.inputs[0].default_value = 1.0
    l.new(ex.outputs[0], fac.inputs[1])
    clampf = n.new("ShaderNodeMath"); clampf.operation = "MINIMUM"; clampf.inputs[1].default_value = 0.9
    l.new(fac.outputs[0], clampf.inputs[0])
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = HAZE
    em.inputs["Strength"].default_value = strength
    mix = n.new("ShaderNodeMixShader")
    l.new(clampf.outputs[0], mix.inputs[0])
    l.new(surface_socket, mix.inputs[1])
    l.new(em.outputs[0], mix.inputs[2])
    return mix.outputs[0]


def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for nd in list(nt.nodes):
        nt.nodes.remove(nd)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    return m, nt, out


def no_light_sampling(m):
    # Emissive signs/windows are seen and reflected but don't act as lights;
    # real lamps placed in front of them do the lighting (less noise, faster).
    if hasattr(m, "emission_sampling"):
        m.emission_sampling = "NONE"
    if hasattr(m, "cycles") and hasattr(m.cycles, "emission_sampling"):
        m.cycles.emission_sampling = "NONE"


def obj_attr(n, name):
    """Per-object custom property read in the shader. Changing it per frame only
    updates the object in Cycles; editing node values would recompile shaders."""
    a = n.new("ShaderNodeAttribute")
    a.attribute_type = "OBJECT"
    a.attribute_name = name
    return a.outputs["Fac"]


def mat_emit(name, color, strength, haze=0.7, attr=None):
    m, nt, out = new_mat(name)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = color
    em.inputs["Strength"].default_value = strength
    if attr:
        mul = nt.nodes.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = strength
        nt.links.new(obj_attr(nt.nodes, attr), mul.inputs[0])
        nt.links.new(mul.outputs[0], em.inputs["Strength"])
    sock = em.outputs[0]
    if haze:
        sock = add_haze(nt, sock, density=0.0052, strength=haze)
    finish(nt, sock, out)
    no_light_sampling(m)
    return m


def mat_dark(name, color=(0.010, 0.010, 0.011, 1), rough=0.5, metal=0.3, grime=0.0):
    """Plain surface. `grime` > 0 breaks it up with blotches and wet streaks
    (darker patches, glossier where rain runs), so concrete and metal read as
    old and soaked rather than as flat CG boxes."""
    m, nt, out = new_mat(name)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if grime:
        n, l = nt.nodes, nt.links
        math_ = _mathf(n, l)
        tc = n.new("ShaderNodeTexCoord")
        blot = n.new("ShaderNodeTexNoise"); blot.inputs["Scale"].default_value = 0.35; blot.inputs["Detail"].default_value = 4
        l.new(tc.outputs["Object"], blot.inputs["Vector"])
        k = math_("MULTIPLY_ADD", blot.outputs["Fac"], vb=1.2 * grime); k.node.inputs[2].default_value = 1.0 - 0.6 * grime
        col = n.new("ShaderNodeVectorMath"); col.operation = "SCALE"
        col.inputs[0].default_value = color[:3]
        l.new(k, col.inputs["Scale"])
        l.new(col.outputs[0], b.inputs["Base Color"])
        r = math_("MULTIPLY_ADD", blot.outputs["Fac"], vb=0.5); r.node.inputs[2].default_value = rough - 0.25
        l.new(r, b.inputs["Roughness"])
    finish(nt, add_haze(nt, b.outputs[0]), out)
    return m


def facade_bsdf(n, l, math_, u, z, rnd, facade, cool):
    """The wall between the windows. v2 was near-black everywhere; v3 gives the
    city a dull, wet, lived-in base (grime blotches, rain streaks, joints) that
    only the lights bring to life."""
    b = n.new("ShaderNodeBsdfPrincipled")
    if facade == "glass" or cool:
        b.inputs["Base Color"].default_value = (0.020, 0.023, 0.026, 1)
        b.inputs["Roughness"].default_value = 0.18
        b.inputs["Metallic"].default_value = 0.7
        return b.outputs[0]
    # grime blotches + vertical rain streaks in facade space (u along the wall, z up)
    comb = n.new("ShaderNodeCombineXYZ")
    l.new(u, comb.inputs[0]); l.new(z, comb.inputs[1]); l.new(rnd, comb.inputs[2])
    blot = n.new("ShaderNodeTexNoise"); blot.inputs["Scale"].default_value = 0.08; blot.inputs["Detail"].default_value = 4
    l.new(comb.outputs[0], blot.inputs["Vector"])
    sc = n.new("ShaderNodeCombineXYZ")
    l.new(math_("MULTIPLY", u, vb=1.4), sc.inputs[0]); l.new(math_("MULTIPLY", z, vb=0.05), sc.inputs[1]); l.new(rnd, sc.inputs[2])
    streak = n.new("ShaderNodeTexNoise"); streak.inputs["Scale"].default_value = 1.3; streak.inputs["Detail"].default_value = 2
    l.new(sc.outputs[0], streak.inputs["Vector"])
    grime = math_("MULTIPLY_ADD", blot.outputs["Fac"], vb=1.3); grime.node.inputs[2].default_value = 0.35
    wet = math_("MAXIMUM", math_("SUBTRACT", streak.outputs["Fac"], vb=0.5), vb=0.0)  # 0..0.5 where water runs
    grime = math_("MULTIPLY", grime, math_("SUBTRACT", va=1.0, b=math_("MULTIPLY", wet, vb=0.9)))
    if facade == "masonry":
        vec = n.new("ShaderNodeCombineXYZ"); l.new(u, vec.inputs[0]); l.new(z, vec.inputs[1])
        br = n.new("ShaderNodeTexBrick")
        br.inputs["Color1"].default_value = (0.070, 0.050, 0.040, 1)
        br.inputs["Color2"].default_value = (0.052, 0.042, 0.036, 1)
        br.inputs["Mortar"].default_value = (0.022, 0.022, 0.022, 1)
        br.inputs["Scale"].default_value = 1.0
        br.inputs["Mortar Size"].default_value = 0.018
        br.inputs["Brick Width"].default_value = 0.9
        br.inputs["Row Height"].default_value = 0.3
        l.new(vec.outputs[0], br.inputs["Vector"])
        base = br.outputs["Color"]
        rough_lo, metal = 0.55, 0.0
    else:
        # concrete: dull grey slabs with dark panel joints (brutalist), or plain dark render
        joint_u = math_("LESS_THAN", math_("FRACT", math_("MULTIPLY", u, vb=1 / 4.8)), vb=0.015)
        joint_v = math_("LESS_THAN", math_("FRACT", math_("MULTIPLY", z, vb=1 / 3.1)), vb=0.02)
        joint = math_("SUBTRACT", va=1.0, b=math_("MULTIPLY", math_("MAXIMUM", joint_u, joint_v), vb=0.55))
        mix = n.new("ShaderNodeVectorMath"); mix.operation = "SCALE"
        mix.inputs[0].default_value = (0.068, 0.067, 0.064) if facade == "concrete" else (0.036, 0.034, 0.032)
        l.new(joint, mix.inputs["Scale"])
        base = mix.outputs[0]
        rough_lo, metal = (0.6, 0.0) if facade == "concrete" else (0.5, 0.15)
    col = n.new("ShaderNodeVectorMath"); col.operation = "SCALE"
    l.new(base, col.inputs[0]); l.new(grime, col.inputs["Scale"])
    l.new(col.outputs[0], b.inputs["Base Color"])
    rough = math_("SUBTRACT", va=rough_lo + 0.25, b=math_("MULTIPLY", wet, vb=1.2))  # glossy where it's wet
    l.new(rough, b.inputs["Roughness"])
    b.inputs["Metallic"].default_value = metal
    return b.outputs[0]


def _mathf(n, l):
    def math_(op, a=None, b=None, va=None, vb=None):
        nd = n.new("ShaderNodeMath"); nd.operation = op
        if a is not None: l.new(a, nd.inputs[0])
        elif va is not None: nd.inputs[0].default_value = va
        if b is not None: l.new(b, nd.inputs[1])
        elif vb is not None: nd.inputs[1].default_value = vb
        return nd.outputs[0]
    return math_


def mat_tower(name="tower", dens_lo=0.05, dens_span=0.26, bright=1.25, cool=False, facade="plain"):
    """Facade with a procedural, per-building grid of lit windows.
    `cool` towers (corporate glass) get a denser, dimmer cool-white grid.
    `facade` picks the wall: plain, masonry (brick), concrete (brutalist panels)."""
    m, nt, out = new_mat(name)
    n, l = nt.nodes, nt.links
    math_ = _mathf(n, l)
    geo = n.new("ShaderNodeNewGeometry")
    info = n.new("ShaderNodeObjectInfo")
    pos = n.new("ShaderNodeSeparateXYZ"); l.new(geo.outputs["Position"], pos.inputs[0])
    nrm = n.new("ShaderNodeSeparateXYZ"); l.new(geo.outputs["Normal"], nrm.inputs[0])

    ax = math_("ABSOLUTE", nrm.outputs["X"])
    ay = math_("ABSOLUTE", nrm.outputs["Y"])
    az = math_("ABSOLUTE", nrm.outputs["Z"])
    u = math_("ADD", math_("MULTIPLY", pos.outputs["Y"], ax), math_("MULTIPLY", pos.outputs["X"], ay))
    u = math_("ADD", u, math_("MULTIPLY", info.outputs["Random"], vb=97.0))
    pitch_u, pitch_v = (1.25, 3.6) if cool else (1.6, 3.1)
    gu = math_("MULTIPLY", u, vb=1 / pitch_u)
    gv = math_("MULTIPLY", pos.outputs["Z"], vb=1 / pitch_v)
    fu = math_("FRACT", gu); fv = math_("FRACT", gv)
    cu = math_("FLOOR", gu); cv = math_("FLOOR", gv)
    lo_u, hi_u = (0.12, 0.88) if cool else (0.28, 0.72)
    inu = math_("MULTIPLY", math_("GREATER_THAN", fu, vb=lo_u), math_("LESS_THAN", fu, vb=hi_u))
    inv = math_("MULTIPLY", math_("GREATER_THAN", fv, vb=0.30), math_("LESS_THAN", fv, vb=0.74))
    aperture = math_("MULTIPLY", inu, inv)
    wall = math_("LESS_THAN", az, vb=0.5)
    above = math_("GREATER_THAN", pos.outputs["Z"], vb=5.5)
    aperture = math_("MULTIPLY", math_("MULTIPLY", aperture, wall), above)
    comb = n.new("ShaderNodeCombineXYZ")
    l.new(cu, comb.inputs[0]); l.new(cv, comb.inputs[1]); l.new(info.outputs["Random"], comb.inputs[2])
    wn = n.new("ShaderNodeTexWhiteNoise"); wn.noise_dimensions = "3D"
    l.new(comb.outputs[0], wn.inputs["Vector"])
    dens = math_("MULTIPLY_ADD", info.outputs["Random"], vb=dens_span)
    dens.node.inputs[2].default_value = dens_lo
    lit = math_("LESS_THAN", wn.outputs["Value"], dens)
    win = math_("MULTIPLY", aperture, lit)
    sepc = n.new("ShaderNodeSeparateColor"); l.new(wn.outputs["Color"], sepc.inputs[0])
    ramp = n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    if cool:
        cr.elements[0].position = 0.0; cr.elements[0].color = COOL_WHITE
        cr.elements[1].position = 0.7; cr.elements[1].color = WHITE_WARM
        e = cr.elements.new(0.93); e.color = NEON_RED
    else:
        cr.elements[0].position = 0.0; cr.elements[0].color = AMBER
        cr.elements[1].position = 0.42; cr.elements[1].color = WHITE_WARM
        e = cr.elements.new(0.62); e.color = NEON_RED
        e = cr.elements.new(0.80); e.color = COOL_WHITE
        e = cr.elements.new(0.975); e.color = CYAN
    l.new(sepc.outputs[0], ramp.inputs["Fac"])
    bj = math_("MULTIPLY_ADD", sepc.outputs[2], vb=1.5)
    bj.node.inputs[2].default_value = 0.3
    strength = math_("MULTIPLY", win, bj)
    slat = math_("MULTIPLY_ADD", math_("GREATER_THAN", math_("FRACT", math_("MULTIPLY", fv, vb=22.0)), vb=0.45), vb=0.55)
    slat.node.inputs[2].default_value = 0.45
    fall = math_("MULTIPLY_ADD", fv, vb=-1.1); fall.node.inputs[2].default_value = 1.25
    strength = math_("MULTIPLY", math_("MULTIPLY", strength, slat), fall)
    strength = math_("MULTIPLY", strength, vb=bright)
    em = n.new("ShaderNodeEmission")
    l.new(ramp.outputs["Color"], em.inputs["Color"])
    l.new(strength, em.inputs["Strength"])
    wall = facade_bsdf(n, l, math_, u, pos.outputs["Z"], info.outputs["Random"], facade, cool)
    add = n.new("ShaderNodeAddShader")
    l.new(wall, add.inputs[0]); l.new(em.outputs[0], add.inputs[1])
    finish(nt, add_haze(nt, add.outputs[0]), out)
    no_light_sampling(m)
    return m


def mat_road():
    """Wet asphalt: near-mirror puddles in a rough, dark road, faint ripple bump."""
    m, nt, out = new_mat("road")
    n, l = nt.nodes, nt.links
    tc = n.new("ShaderNodeTexCoord")
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 0.09
    noise.inputs["Detail"].default_value = 6
    l.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = n.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.44
    ramp.inputs["From Max"].default_value = 0.56
    ramp.inputs["To Min"].default_value = 0.38
    ramp.inputs["To Max"].default_value = 0.015
    l.new(noise.outputs["Fac"], ramp.inputs["Value"])
    bump_n = n.new("ShaderNodeTexNoise"); bump_n.inputs["Scale"].default_value = 4.0
    l.new(tc.outputs["Object"], bump_n.inputs["Vector"])
    bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.035
    l.new(bump_n.outputs["Fac"], bump.inputs["Height"])
    b = n.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (0.011, 0.011, 0.012, 1)
    b.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = 0.8
    l.new(ramp.outputs[0], b.inputs["Roughness"])
    l.new(bump.outputs["Normal"], b.inputs["Normal"])
    finish(nt, add_haze(nt, b.outputs[0]), out)
    return m


def mat_shopfront(name, color, strength=1.1):
    """Lit shop window: mullioned glass, brighter towards the top, uneven inside."""
    m, nt, out = new_mat(name)
    n, l = nt.nodes, nt.links
    math_ = _mathf(n, l)
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["UV"], sep.inputs[0])
    mull = math_("GREATER_THAN", math_("FRACT", math_("MULTIPLY", sep.outputs["X"], vb=11.0)), vb=0.06)
    rail = math_("GREATER_THAN", math_("ABSOLUTE", math_("SUBTRACT", sep.outputs["Y"], vb=0.72)), vb=0.025)
    grad = math_("MULTIPLY_ADD", sep.outputs["Y"], vb=1.1); grad.node.inputs[2].default_value = 0.15
    noise = n.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 4.0
    l.new(tc.outputs["UV"], noise.inputs["Vector"])
    k = math_("MULTIPLY", math_("MULTIPLY", mull, rail), grad)
    k = math_("MULTIPLY", k, noise.outputs["Fac"])
    k = math_("MULTIPLY", k, vb=strength * 2.0)
    em = n.new("ShaderNodeEmission"); em.inputs["Color"].default_value = color
    l.new(k, em.inputs["Strength"])
    b = n.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (0.01, 0.01, 0.01, 1)
    b.inputs["Roughness"].default_value = 0.08
    add = n.new("ShaderNodeAddShader")
    l.new(b.outputs[0], add.inputs[0]); l.new(em.outputs[0], add.inputs[1])
    finish(nt, add_haze(nt, add.outputs[0]), out)
    no_light_sampling(m)
    return m


def mat_holo(name, color, strength=3.0, alpha=0.55, glow=0.35):
    """Hologram: emissive, see-through, with scanlines that scroll with the frame
    (the `scan` value node is driven per frame) and a soft vertical gradient."""
    m, nt, out = new_mat(name)
    n, l = nt.nodes, nt.links
    math_ = _mathf(n, l)
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["Object"], sep.inputs[0])
    scan = obj_attr(n, "scan")
    lines = math_("FRACT", math_("ADD", math_("MULTIPLY", sep.outputs["Z"], vb=2.4), scan))
    lines = math_("MULTIPLY_ADD", math_("GREATER_THAN", lines, vb=0.42), vb=0.75)
    lines.node.inputs[2].default_value = 0.25
    band = math_("FRACT", math_("ADD", math_("MULTIPLY", sep.outputs["Z"], vb=0.05), math_("MULTIPLY", scan, vb=0.07)))
    band = math_("MULTIPLY_ADD", math_("GREATER_THAN", band, vb=0.9), vb=1.4)
    band.node.inputs[2].default_value = 1.0
    k = math_("MULTIPLY", math_("MULTIPLY", lines, band), obj_attr(n, "hflick"))
    em = n.new("ShaderNodeEmission"); em.inputs["Color"].default_value = color
    l.new(math_("MULTIPLY", k, vb=strength), em.inputs["Strength"])
    tr = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader")
    l.new(math_("MULTIPLY", k, vb=alpha), mix.inputs[0])
    l.new(tr.outputs[0], mix.inputs[1]); l.new(em.outputs[0], mix.inputs[2])
    add = n.new("ShaderNodeAddShader")
    l.new(mix.outputs[0], add.inputs[0])
    em2 = n.new("ShaderNodeEmission"); em2.inputs["Color"].default_value = color
    l.new(math_("MULTIPLY", k, vb=strength * glow), em2.inputs["Strength"])
    l.new(em2.outputs[0], add.inputs[1])
    finish(nt, add.outputs[0], out)
    no_light_sampling(m)
    return m


def mat_billboard(name, kind, col_a, col_b, strength=3.2):
    """Animated LED billboard. A procedural graphic on the plane's UVs that moves
    with the object's `t` attribute (set per frame, so only the object updates):
    eq (equalizer bars), wave (sine traces over a grid), scroll (diagonal bands),
    rings (pulsing circles). A dim fill keeps the panel from reading as a hole."""
    m, nt, out = new_mat(name)
    n, l = nt.nodes, nt.links
    math_ = _mathf(n, l)
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["UV"], sep.inputs[0])
    u, v = sep.outputs["X"], sep.outputs["Y"]
    t = obj_attr(n, "t")
    if kind == "eq":
        idx = math_("FLOOR", math_("MULTIPLY", u, vb=18.0))
        comb = n.new("ShaderNodeCombineXYZ")
        l.new(idx, comb.inputs[0]); l.new(math_("FLOOR", math_("MULTIPLY", t, vb=0.5)), comb.inputs[1])
        wn = n.new("ShaderNodeTexWhiteNoise"); wn.noise_dimensions = "3D"
        l.new(comb.outputs[0], wn.inputs["Vector"])
        hgt = math_("MULTIPLY_ADD", wn.outputs["Value"], vb=0.55); hgt.node.inputs[2].default_value = 0.18
        wob = math_("MULTIPLY", math_("SINE", math_("ADD", math_("MULTIPLY", idx, vb=0.8), math_("MULTIPLY", t, vb=0.35))), vb=0.16)
        hgt = math_("ADD", hgt, wob)
        gap = math_("GREATER_THAN", math_("FRACT", math_("MULTIPLY", u, vb=18.0)), vb=0.2)
        seg = math_("GREATER_THAN", math_("FRACT", math_("MULTIPLY", v, vb=26.0)), vb=0.22)  # LED segments
        on = math_("MULTIPLY", math_("MULTIPLY", math_("LESS_THAN", v, hgt), gap), seg)
    elif kind == "wave":
        ph = math_("MULTIPLY", t, vb=0.22)
        w1 = math_("ADD", math_("MULTIPLY", math_("SINE", math_("ADD", math_("MULTIPLY", u, vb=9.0), ph)), vb=0.26), vb=0.5)
        w2 = math_("ADD", math_("MULTIPLY", math_("SINE", math_("SUBTRACT", math_("MULTIPLY", u, vb=14.0), math_("MULTIPLY", ph, vb=1.6))), vb=0.16), vb=0.5)
        on1 = math_("LESS_THAN", math_("ABSOLUTE", math_("SUBTRACT", v, w1)), vb=0.03)
        on2 = math_("MULTIPLY", math_("LESS_THAN", math_("ABSOLUTE", math_("SUBTRACT", v, w2)), vb=0.018), vb=0.6)
        grid = math_("MULTIPLY", math_("MAXIMUM", math_("LESS_THAN", math_("FRACT", math_("MULTIPLY", u, vb=12.0)), vb=0.04),
                                       math_("LESS_THAN", math_("FRACT", math_("MULTIPLY", v, vb=7.0)), vb=0.06)), vb=0.18)
        on = math_("MAXIMUM", math_("MAXIMUM", on1, on2), grid)
    elif kind == "scroll":
        bands = math_("FRACT", math_("SUBTRACT", math_("ADD", math_("MULTIPLY", u, vb=4.0), math_("MULTIPLY", v, vb=1.6)), math_("MULTIPLY", t, vb=0.05)))
        on = math_("MULTIPLY_ADD", math_("LESS_THAN", bands, vb=0.42), vb=0.85)
        on.node.inputs[2].default_value = 0.15
    else:  # rings
        cu = math_("SUBTRACT", u, vb=0.5); cv = math_("MULTIPLY", math_("SUBTRACT", v, vb=0.5), vb=0.6)
        r = math_("SQRT", math_("ADD", math_("MULTIPLY", cu, cu), math_("MULTIPLY", cv, cv)))
        ring = math_("FRACT", math_("SUBTRACT", math_("MULTIPLY", r, vb=6.0), math_("MULTIPLY", t, vb=0.06)))
        on = math_("MULTIPLY", math_("LESS_THAN", ring, vb=0.28), math_("SUBTRACT", va=1.0, b=math_("MULTIPLY", r, vb=1.3)))
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = col_a; mix.inputs[7].default_value = col_b
    l.new(v, mix.inputs[0])
    k = math_("ADD", math_("MULTIPLY", on, vb=strength), vb=0.12)  # dim fill
    em = n.new("ShaderNodeEmission")
    l.new(mix.outputs[2], em.inputs["Color"]); l.new(k, em.inputs["Strength"])
    finish(nt, add_haze(nt, em.outputs[0], density=0.0052, strength=0.3), out)
    no_light_sampling(m)
    return m


def mat_rain():
    m, nt, out = new_mat("rain")
    n, l = nt.nodes, nt.links
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb("#e6eef2")
    em.inputs["Strength"].default_value = 0.38
    tr = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader"); mix.inputs[0].default_value = 0.3
    l.new(tr.outputs[0], mix.inputs[1]); l.new(em.outputs[0], mix.inputs[2])
    finish(nt, mix.outputs[0], out)
    no_light_sampling(m)
    return m


def mat_world(scene):
    """Sky: near-black teal zenith, a cooler smog band at the horizon. In the volume
    pass camera rays see black, but the same colour still lights the fog faintly
    (cool ambient haze); see set_pass()."""
    w = bpy.data.worlds.new("night")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    n, l = nt.nodes, nt.links
    for nd in list(n):
        n.remove(nd)
    out = n.new("ShaderNodeOutputWorld")
    bg = n.new("ShaderNodeBackground"); bg.name = "sky"
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["Generated"], sep.inputs[0])
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -0.04
    mr.inputs["From Max"].default_value = 0.4
    l.new(sep.outputs["Z"], mr.inputs["Value"])
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = (0.034, 0.060, 0.068, 1)  # horizon: grey-teal smog lit by the city
    mix.inputs[7].default_value = (0.004, 0.0055, 0.0065, 1)  # zenith: overcast, never quite black
    l.new(mr.outputs[0], mix.inputs[0])
    # light pollution: a teal glow band hugging the skyline (only seen once the camera clears the roofs)
    gl = n.new("ShaderNodeMapRange")
    gl.inputs["From Min"].default_value = 0.16
    gl.inputs["From Max"].default_value = 0.0
    l.new(sep.outputs["Z"], gl.inputs["Value"])
    glow = n.new("ShaderNodeMix"); glow.data_type = "RGBA"; glow.blend_type = "ADD"
    l.new(gl.outputs[0], glow.inputs[0])
    l.new(mix.outputs[2], glow.inputs[6])
    glow.inputs[7].default_value = (0.012, 0.036, 0.044, 1)
    l.new(glow.outputs[2], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    # camera-ray switch, used by the volume pass
    lp = n.new("ShaderNodeLightPath")
    sw = n.new("ShaderNodeValue"); sw.name = "volume_pass"; sw.outputs[0].default_value = 0.0
    hide = n.new("ShaderNodeMath"); hide.operation = "MULTIPLY"
    l.new(lp.outputs["Is Camera Ray"], hide.inputs[0]); l.new(sw.outputs[0], hide.inputs[1])
    black = n.new("ShaderNodeBackground"); black.inputs["Color"].default_value = (0, 0, 0, 1)
    ms = n.new("ShaderNodeMixShader")
    l.new(hide.outputs[0], ms.inputs[0])
    l.new(bg.outputs[0], ms.inputs[1]); l.new(black.outputs[0], ms.inputs[2])
    l.new(ms.outputs[0], out.inputs["Surface"])
    return w


def mat_smog():
    """Volume for the volume pass: height-falloff smog with slow patchy noise.
    Forward scattering, so lights you look towards bloom into halos."""
    m, nt, out = new_mat("smog")
    n, l = nt.nodes, nt.links
    math_ = _mathf(n, l)
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["Object"], sep.inputs[0])
    # the domain is a unit cube scaled up; object z runs 0..1 over 0..420 m
    zm = math_("MULTIPLY", sep.outputs["Z"], vb=420.0)
    fall = math_("EXPONENT", math_("MULTIPLY", zm, vb=-1 / 38.0))
    dens = math_("MULTIPLY_ADD", fall, vb=0.0048)
    dens.node.inputs[2].default_value = 0.0007  # thin high haze for searchlight beams
    noise = n.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 9.0
    noise.inputs["Detail"].default_value = 3
    l.new(tc.outputs["Object"], noise.inputs["Vector"])
    patch = math_("MULTIPLY_ADD", noise.outputs["Fac"], vb=1.3)
    patch.node.inputs[2].default_value = 0.35
    dens = math_("MULTIPLY", dens, patch)
    v = n.new("ShaderNodeVolumePrincipled")
    v.inputs["Color"].default_value = (0.8, 0.9, 1.0, 1)
    v.inputs["Anisotropy"].default_value = 0.5
    l.new(dens, v.inputs["Density"])
    l.new(v.outputs[0], out.inputs["Volume"])
    return m


def mat_steam(seed):
    """A rising plume of street steam (volume pass only)."""
    m, nt, out = new_mat(f"steam{seed}")
    n, l = nt.nodes, nt.links
    math_ = _mathf(n, l)
    tc = n.new("ShaderNodeTexCoord")
    gen = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["Generated"], gen.inputs[0])
    rise = obj_attr(n, "rise")
    vec = n.new("ShaderNodeVectorMath"); vec.operation = "ADD"
    l.new(tc.outputs["Object"], vec.inputs[0])
    comb = n.new("ShaderNodeCombineXYZ"); comb.inputs[0].default_value = seed * 3.1
    l.new(rise, comb.inputs[2])
    l.new(comb.outputs[0], vec.inputs[1])
    noise = n.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 2.2
    noise.inputs["Detail"].default_value = 4; noise.inputs["Distortion"].default_value = 0.6
    l.new(vec.outputs[0], noise.inputs["Vector"])
    # core: dense near the vent, widening and thinning as it rises
    cx = math_("SUBTRACT", gen.outputs["X"], vb=0.5); cy = math_("SUBTRACT", gen.outputs["Y"], vb=0.5)
    r = math_("SQRT", math_("ADD", math_("MULTIPLY", cx, cx), math_("MULTIPLY", cy, cy)))
    width = math_("MULTIPLY_ADD", gen.outputs["Z"], vb=0.35); width.node.inputs[2].default_value = 0.12
    core = math_("MAXIMUM", math_("SUBTRACT", va=1.0, b=math_("DIVIDE", r, width)), vb=0.0)
    up = math_("SUBTRACT", va=1.0, b=gen.outputs["Z"])
    shape = math_("MULTIPLY", math_("MULTIPLY", core, up), math_("MAXIMUM", math_("SUBTRACT", noise.outputs["Fac"], vb=0.32), vb=0.0))
    v = n.new("ShaderNodeVolumePrincipled")
    v.inputs["Color"].default_value = (0.92, 0.94, 0.96, 1)
    v.inputs["Anisotropy"].default_value = 0.3
    l.new(math_("MULTIPLY", shape, vb=1.6), v.inputs["Density"])
    l.new(v.outputs[0], out.inputs["Volume"])
    return m


# --------------------------------------------------------------------------
# Neon text. Outline signs use the glyph curves with fill off + bevel, so they
# read as bent glass tubes; box signs are filled letters.
# --------------------------------------------------------------------------
_FONTS = {}


def font(name):
    if name not in _FONTS:
        _FONTS[name] = bpy.data.fonts.load(os.path.join(FONT_DIR, name))
    return _FONTS[name]


def neon_text(name, text, size, mat, loc, rot, tube=False, fontfile=FONT_DISPLAY,
              vertical=False, coll=None, spacing=1.0, extrude=0.03):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = "\n".join(text) if vertical else text
    cu.font = font(fontfile)
    cu.size = size
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.space_character = spacing
    if vertical:
        cu.space_line = 0.82
    if tube:
        cu.fill_mode = "NONE"
        cu.bevel_depth = size * 0.024
        cu.bevel_resolution = 1
        cu.resolution_u = 6
    else:
        cu.extrude = size * extrude
        cu.resolution_u = 4
    cu.materials.append(mat)
    ob = bpy.data.objects.new(name, cu)
    ob.location = loc
    ob.rotation_euler = rot
    return link(ob, coll)


def add_light(name, kind, loc, color, energy, coll, size=0.5, rot=None, spot=None, blend=0.3):
    lt = bpy.data.lights.new(name, kind)
    lt.color = color
    lt.energy = energy
    if kind == "AREA":
        lt.size = size
    else:
        lt.shadow_soft_size = size
    if kind == "SPOT":
        lt.spot_size = spot or math.radians(60)
        lt.spot_blend = blend
    ob = bpy.data.objects.new(name, lt)
    ob.location = loc
    if rot is not None:
        ob.rotation_euler = rot
    return link(ob, coll)


# --------------------------------------------------------------------------
# The city
# --------------------------------------------------------------------------
ROAD_HALF = 7.0
WALK = 4.0
ST_EDGE = ROAD_HALF + WALK  # building line
END_Y = 340.0
RAIL_Y = 96.0
RAIL_Z = 15.0
BRIDGE_Y = 130.0
STREET_END = 300.0                # towers line the avenue up to here
SCREEN_Y = 304.0                  # low block with the giant CHIDS FM screen, well behind the climb
MEGA_FACE = END_Y + 9.6
SIGN_Z = 128.0

SPILL = {"red": (1.0, 0.07, 0.025), "yellow": (1.0, 0.55, 0.06), "cyan": (0.25, 0.8, 1.0), "cool": (0.62, 0.82, 1.0)}


class Dyn:
    """Handles to everything that changes per frame (see apply_frame)."""

    def __init__(self):
        self.cam = None
        self.rain = None
        self.train = None
        self.avs = []          # (object, path fn)
        self.cars = []         # (object, x, y0, v)
        self.flickers = []     # (material name, seed) -> objects get a "flick" attribute
        self.holo_mats = []    # materials whose objects get "scan"/"hflick" attributes
        self.holo_spin = []    # objects rotating slowly
        self.searchlights = []  # (object, base yaw, tilt, phase)
        self.steam_obs = []
        self.attr_obs = {}     # material name -> objects using it (filled after the build)
        self.beacons = []      # (socket, base, phase)
        self.peds = []         # (object, x, y0, v): pedestrians strolling along the sidewalks
        self.billboards = []   # LED billboard planes, animated through their "t" attribute


def build_city(scene, rnd, dyn):
    city = bpy.data.collections.new("city"); scene.collection.children.link(city)
    signs = bpy.data.collections.new("signs"); scene.collection.children.link(signs)
    lights = bpy.data.collections.new("lights"); scene.collection.children.link(lights)
    movers = bpy.data.collections.new("movers"); scene.collection.children.link(movers)

    tower = mat_tower()
    tower_cool = mat_tower("tower_cool", dens_lo=0.18, dens_span=0.3, bright=0.55, cool=True, facade="glass")
    tower_masonry = mat_tower("tower_masonry", dens_lo=0.08, dens_span=0.3, bright=1.1, facade="masonry")
    tower_concrete = mat_tower("tower_concrete", dens_lo=0.06, dens_span=0.22, bright=1.0, facade="concrete")
    dark = mat_dark("facade_dark", color=(0.022, 0.021, 0.02, 1), rough=0.5, metal=0.2, grime=0.6)
    metal = mat_dark("metal", color=(0.035, 0.033, 0.031, 1), rough=0.4, metal=0.75, grime=0.7)
    concrete = mat_dark("concrete", color=(0.065, 0.064, 0.061, 1), rough=0.75, metal=0.0, grime=0.8)
    board = mat_dark("sign_board", color=(0.006, 0.005, 0.005, 1), rough=0.3, metal=0.5)
    road = mat_road()
    curb = mat_dark("curb", color=(0.045, 0.045, 0.047, 1), rough=0.35, metal=0.0, grime=0.9)
    emit = {
        "red": mat_emit("neon_red", NEON_RED, 6.5),
        "red_dim": mat_emit("neon_red_dim", NEON_RED, 2.2),
        "red_deep": mat_emit("neon_red_deep", RED_DEEP, 2.4),
        "yellow": mat_emit("neon_yellow", NEON_YELLOW, 5.0),
        "yellow_dim": mat_emit("neon_yellow_dim", NEON_YELLOW, 1.6),
        "cyan": mat_emit("neon_cyan", CYAN, 5.0),
        "warm": mat_emit("lamp_warm", WHITE_WARM, 9.0),
        "cool": mat_emit("lamp_cool", COOL_WHITE, 12.0, haze=0.4),
        "led": mat_emit("led_white", WHITE_WARM, 14.0, haze=0.4),
        "tail": mat_emit("tail_light", NEON_RED, 11.0, haze=0.4),
        "tail_streak": mat_emit("tail_streak", NEON_RED, 1.2, haze=0.4),
        "head": mat_emit("head_light", WHITE_WARM, 14.0, haze=0.4),
        "giant": mat_emit("giant_sign", NEON_RED, 10.0, haze=0.2),
        "giant_y": mat_emit("giant_sign_y", NEON_YELLOW, 7.0, haze=0.2),
        "window_train": mat_emit("train_windows", WHITE_WARM, 4.5, haze=0.5),
        "beacon": mat_emit("beacon", NEON_RED, 12.0, haze=0.3),
    }
    shops = [mat_shopfront("shop_red", NEON_RED, 0.3), mat_shopfront("shop_amber", AMBER, 0.42),
             mat_shopfront("shop_amber2", AMBER, 0.28), mat_shopfront("shop_cool", COOL_WHITE, 0.4),
             mat_shopfront("shop_cool2", COOL_WHITE, 0.22), mat_shopfront("shop_dark", NEON_RED, 0.12)]
    mega_mat = mat_tower("tower_mega", dens_lo=0.03, dens_span=0.05, bright=0.8)

    greebles = BoxBatch()   # AC units, ledges, fins: dark metal
    leds = BoxBatch()       # thin LED strips: white-hot
    ledges_red = BoxBatch()  # red ledge strips
    escapes = BoxBatch()    # fire escapes and pipes: rusty metal
    slabs = BoxBatch()      # brutalist slab bands: grimy concrete

    # ground: road, sidewalks, curbs
    plane("road", (0, END_Y / 2 + 20, 0), (2 * ROAD_HALF, END_Y + 120), (0, 0, 0), road, city)
    for s in (-1, 1):
        box(f"walk{s}", (s * (ROAD_HALF + WALK / 2), END_Y / 2 + 20, 0), (WALK, END_Y + 120, 0.16), curb, city)
    lane = mat_emit("lane", WHITE_WARM, 0.35)
    for i in range(0, int(END_Y), 9):
        box(f"dash{i}", (0, i, 0.005), (0.16, 3.2, 0.01), lane, city)

    # towers, both sides, with setbacks, greebles and a sign on most
    sign_i = 0
    for side in (-1, 1):
        y = -24.0
        while y < STREET_END:
            w = rnd.uniform(9, 19)
            d = rnd.uniform(14, 28)
            h = rnd.choice([rnd.uniform(30, 70), rnd.uniform(60, 130), rnd.uniform(100, 190)])
            if y > 225:
                h = rnd.uniform(30, 85)  # stay under the sight line to the sign at the end
            gap = rnd.uniform(0.8, 3.0)
            cool = rnd.random() < 0.28
            cx = side * (ST_EDGE + d / 2 + rnd.uniform(0, 1.5))
            cy = y + w / 2
            face_x = cx - side * d / 2  # street-facing facade plane
            # v3 dressing uses its own generator, so the approved v2 layout doesn't move
            rd = random.Random(int((y + 100) * 37) * 3 + side)
            facade = "glass" if cool else rd.choices(["masonry", "concrete", "plain"], weights=[0.45, 0.35, 0.2])[0]
            tmat = {"glass": tower_cool, "masonry": tower_masonry, "concrete": tower_concrete, "plain": tower}[facade]
            box(f"t{side}_{int(y)}", (cx, cy, 0), (d, w, h), tmat, city)
            dress_facade(rd, facade, side, face_x, cy, w, h, escapes, slabs)
            # setback tiers
            top = h
            tier_w, tier_d = w, d
            for k in range(rnd.choice([0, 1, 1, 2])):
                tier_w *= rnd.uniform(0.6, 0.8); tier_d *= rnd.uniform(0.6, 0.8)
                hh = rnd.uniform(12, 40)
                box(f"tc{side}_{int(y)}_{k}", (cx + side * rnd.uniform(1, 4), cy, top), (tier_d, tier_w, hh), tmat, city)
                leds.add(cx + side * 1.5 - side * tier_d / 2, cy, top - 0.15, 0.12, tier_w, 0.12)
                top += hh
            # rooftop antennae with blinking aviation lights
            if rnd.random() < 0.55:
                for a in range(rnd.randint(1, 3)):
                    ax_, ay_ = cx + rnd.uniform(-3, 3), cy + rnd.uniform(-3, 3)
                    ah = rnd.uniform(6, 22)
                    greebles.add(ax_, ay_, top, 0.25, 0.25, ah)
                    b = box(f"av_beacon{side}_{int(y)}_{a}", (ax_, ay_, top + ah), (0.6, 0.6, 0.6), emit["beacon"], signs)
                    dyn.beacons.append((b, rnd.random()))
            # greebles on the street facade: AC units, balconies/ledges, vertical fins
            fx = face_x  # facade plane
            for fl in range(2, int(min(h, 90) / 3.1)):
                z = fl * 3.1
                if rnd.random() < 0.18:  # a ledge/balcony band along this storey
                    greebles.add(fx - side * 0.5, cy, z - 0.25, 1.0, w * rnd.uniform(0.5, 0.95), 0.22)
                    if rnd.random() < 0.25:
                        (ledges_red if rnd.random() < 0.5 else leds).add(fx - side * 1.0, cy, z - 0.32, 0.06, w * 0.6, 0.06)
                for _ in range(rnd.randint(0, 3)):  # AC units
                    greebles.add(fx - side * 0.35, cy + rnd.uniform(-w / 2 + 1, w / 2 - 1), z + 0.2, 0.7, 0.9, 0.6)
            if rnd.random() < 0.35:  # vertical fins
                for e in (-1, 1):
                    greebles.add(fx - side * 0.4, cy + e * (w / 2 - 0.3), 5, 0.8, 0.25, min(h, 120) - 5)
            # vertical corner strip on the street-facing edge
            if rnd.random() < 0.4:
                strip = emit[rnd.choice(["red_dim", "red_dim", "yellow_dim"])]
                for e in (-1, 1):
                    box(f"st{side}_{int(y)}_{e}", (face_x - side * 0.15, cy + e * (w / 2 - 0.2), 6),
                        (0.12, 0.12, min(h, 140) - 8), strip, city)
            # shopfront band: canopy + glowing strip + lit window
            box(f"cn{side}_{int(y)}", (side * (ST_EDGE - 1.2), cy, 4.2), (2.6, w - 1, 0.25), dark, city)
            box(f"cl{side}_{int(y)}", (side * (ST_EDGE - 2.45), cy, 4.15), (0.08, w - 1.2, 0.08),
                emit[rnd.choice(["red", "yellow_dim", "red_dim", "warm"])], city)
            plane(f"sf{side}_{int(y)}", (side * (ST_EDGE - 0.02), cy, 1.75), (w - 1.5, 2.9),
                  (math.pi / 2, 0, math.pi / 2), rnd.choice(shops), city)

            # a neon sign on this building?
            if sign_i < len(SIGN_WORDS) and rnd.random() < 0.85 and 4 < y < 250:
                word, ck, style = SIGN_WORDS[sign_i]
                sign_i += 1
                mat = emit[ck]
                if word in FLICKER_WORDS:  # its own material, driven per object, so it can stutter on its own
                    mat = mat_emit(f"neon_{word}", NEON_RED if ck == "red" else NEON_YELLOW, 6.0 if ck == "red" else 5.0, attr="flick")
                    dyn.flickers.append((mat.name, rnd.random() * 100))
                place_sign(word, ck, style, side, cy, rnd, mat, board, signs, lights, emit)
            y += w + gap

    greebles.build("greebles", metal, city)
    leds.build("led_strips", emit["led"], city)
    ledges_red.build("red_strips", emit["red_dim"], city)
    rust = mat_dark("rust", color=(0.045, 0.026, 0.018, 1), rough=0.55, metal=0.6, grime=0.8)
    escapes.build("fire_escapes", rust, city)
    slabs.build("brutal_slabs", concrete, city)

    build_rail(rnd, dyn, city, movers, lights, emit, concrete, metal, dark)
    build_bridge(city, lights, emit, concrete, tower_cool)
    build_holograms(dyn, signs, lights)
    build_climb(rnd, dyn, city, signs, lights, emit, tower, tower_cool, board, concrete)
    build_mega(rnd, dyn, city, signs, lights, emit, mega_mat, board, tower, tower_cool)
    build_street(rnd, dyn, city, signs, lights, movers, emit, dark, metal)
    build_avs(dyn, movers, lights, emit, dark)
    build_dressing(dyn, city, signs, lights, movers, emit, dark, metal, board)


def dress_facade(rd, facade, side, face_x, cy, w, h, escapes, slabs):
    """Facade detail by building type: fire escapes and drain pipes on masonry,
    deep slab bands on brutalist concrete. Pipes on everything but glass."""
    if facade == "glass":
        return
    out = -side  # towards the street
    for _ in range(rd.randint(1, 3)):  # drain / service pipes
        py = cy + rd.uniform(-w / 2 + 0.6, w / 2 - 0.6)
        escapes.add(face_x + out * 0.12, py, 0.3, 0.16, 0.16, min(h, 70) - 0.5)
    if facade == "masonry" and rd.random() < 0.7:
        # fire escape: platforms each storey, railings, and a zig-zag stair between them
        ew = 4.2
        ey = cy + rd.uniform(-w / 2 + ew / 2 + 0.3, w / 2 - ew / 2 - 0.3) if w > ew + 1 else cy
        top = min(int(h / 3.1), 14)
        for fl in range(2, top):
            z = fl * 3.1
            escapes.add(face_x + out * 0.5, ey, z, 1.0, ew, 0.08)                # platform
            escapes.add(face_x + out * 0.98, ey, z + 0.08, 0.05, ew, 0.05)      # top rail
            escapes.add(face_x + out * 0.98, ey, z + 0.55, 0.05, ew, 0.04)      # mid rail
            for k in range(5):
                escapes.add(face_x + out * 0.98, ey - ew / 2 + k * ew / 4, z + 0.08, 0.05, 0.05, 1.0)  # balusters
            d = 1 if fl % 2 else -1
            for s in range(7):  # stair down to the platform below
                escapes.add(face_x + out * 0.55, ey + d * (-ew / 2 + 0.4 + s * 0.48), z - 0.2 - s * 0.42, 0.7, 0.5, 0.05)
    if facade == "concrete":
        z = 6.2
        while z < min(h, 110) - 2:
            slabs.add(face_x + out * 0.45, cy, z, 0.9, w + 0.2, 0.55 if rd.random() < 0.7 else 1.1)
            z += rd.choice([6.2, 6.2, 9.3])


def build_dressing(dyn, city, signs, lights, movers, emit, dark, metal, board):
    """v3 street life: market stalls with awnings and bulb strings, vending
    machines, trash, pedestrians (some under LED umbrellas), animated LED
    billboards, and more cables and lantern strings, some low enough to sweep
    right over the lens. Own random generator, so v2's layout stays put."""
    rd = random.Random(31337)
    cloth = [mat_dark(f"awning{i}", color=c, rough=0.8, metal=0.0, grime=0.6) for i, c in enumerate(
        [(0.10, 0.022, 0.016, 1), (0.05, 0.052, 0.028, 1), (0.028, 0.036, 0.044, 1), (0.085, 0.062, 0.018, 1)])]
    wood = mat_dark("stall_wood", color=(0.05, 0.035, 0.024, 1), rough=0.6, metal=0.0, grime=0.8)
    trash = mat_dark("trash", color=(0.016, 0.018, 0.017, 1), rough=0.3, metal=0.0, grime=0.5)
    bulb = mat_emit("bulb", WHITE_WARM, 7.0, haze=0.4)
    vend = [mat_emit("vend_cool", COOL_WHITE, 2.6, haze=0.4), mat_emit("vend_red", NEON_RED, 2.4, haze=0.4),
            mat_emit("vend_yellow", NEON_YELLOW, 2.2, haze=0.4)]
    goods = [emit["red_dim"], emit["yellow_dim"], mat_emit("goods_cool", COOL_WHITE, 1.4, haze=0.4)]
    posts, bags = BoxBatch(), BoxBatch()

    def clear_of_poles(y):
        return all(abs(y - p) > 1.6 for p in (RAIL_Y - 1.8, RAIL_Y + 1.8))

    # market strip: stalls on both sidewalks along the first stretch of the street
    for side in (-1, 1):
        y = 2.0 + rd.uniform(0, 3)
        while y < 168:
            if 88 < y < 104:  # leave the rail crossing open
                y = 104
            sw = rd.uniform(2.6, 3.6)
            if not clear_of_poles(y) or rd.random() < 0.18:
                y += sw + rd.uniform(1, 4)
                continue
            x_in, x_out = side * 10.6, side * 8.7
            xc = (x_in + x_out) / 2
            box(f"counter{side}_{int(y)}", (side * 9.75, y, 0.16), (1.1, sw - 0.4, 1.0), wood, city)
            for px in (x_in, x_out):
                for e in (-1, 1):
                    posts.add(px, y + e * (sw / 2 - 0.08), 0.16, 0.08, 0.08, 2.7 if px == x_in else 2.35)
            plane(f"awning{side}_{int(y)}", (xc, y, 2.62), (2.3, sw + 0.2), (0, side * 0.22, 0), rd.choice(cloth), city)
            for k in range(6):  # bulb string along the front edge
                box(f"bulb{side}_{int(y)}_{k}", (x_out - side * 0.05, y - sw / 2 + (k + 0.5) * sw / 6, 2.28 - 0.08 * (k % 2)),
                    (0.11, 0.11, 0.11), bulb, signs)
            add_light(f"stall{side}_{int(y)}", "POINT", (side * 9.5, y, 2.1), (1.0, 0.66, 0.36), 110, lights, size=0.6)
            plane(f"stall_sign{side}_{int(y)}", (side * 10.55, y, 1.95), (sw - 0.6, 0.7), (math.pi / 2, 0, math.pi / 2),
                  rd.choice(goods), signs)
            for _ in range(rd.randint(2, 5)):  # goods on the counter
                posts.add(side * rd.uniform(9.4, 10.1), y + rd.uniform(-sw / 2 + 0.3, sw / 2 - 0.3), 1.16,
                          rd.uniform(0.15, 0.4), rd.uniform(0.15, 0.4), rd.uniform(0.1, 0.35))
            if rd.random() < 0.3:  # a food cart's steam
                m = mat_steam(100 + len(dyn.steam_obs))
                ob = box(f"stall_steam{side}_{int(y)}", (side * 9.5, y, 1.1), (1.8, 1.8, 5.0), m, signs)
                ob["volume_only"] = True; ob["rise"] = 0.0
                dyn.steam_obs.append(ob)
            y += sw + rd.uniform(0.2, 1.4)
    posts.build("stall_posts", metal, city)

    # vending machines against the walls further down, glowing into the wet pavement
    for i in range(12):
        side = 1 if i % 2 else -1
        y = rd.uniform(168, 250) if i < 8 else rd.uniform(8, 160)
        box(f"vend{i}", (side * (ST_EDGE - 0.45), y, 0.16), (0.8, 1.1, 1.95), dark, city)
        mat = rd.choice(vend)
        plane(f"vend_front{i}", (side * (ST_EDGE - 0.86), y, 1.2), (0.95, 1.5), (math.pi / 2, 0, math.pi / 2), mat, signs)
        add_light(f"vend_l{i}", "POINT", (side * (ST_EDGE - 1.6), y, 1.2), (0.7, 0.85, 1.0) if mat is vend[0] else SPILL["red" if mat is vend[1] else "yellow"],
                  60, lights, size=0.5)

    # trash: wet bags piled against the walls
    for _ in range(34):
        side = rd.choice((-1, 1))
        y = rd.uniform(-4, 250)
        for _ in range(rd.randint(3, 7)):
            s = rd.uniform(0.3, 0.7)
            bags.add(side * (ST_EDGE - rd.uniform(0.3, 1.0)), y + rd.uniform(-0.8, 0.8), 0.16 + rd.uniform(0, 0.25), s, s * rd.uniform(0.8, 1.3), s * 0.8)
    bags.build("trash", trash, city)

    # more cables and lantern strings; the low ones sweep over the lens on the street stretch
    cable_mat = mat_dark("cable_v3", color=(0.004, 0.004, 0.004, 1), rough=0.6, metal=0.0)
    lantern = bpy.data.meshes.new("lantern")
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=0.17); bm.to_mesh(lantern); bm.free()
    lantern_mats = [mat_emit("lantern_red", NEON_RED, 2.2, haze=0.5), mat_emit("lantern_amber", AMBER, 1.6, haze=0.5)]
    for i in range(36):
        low = i < 12
        yy = rd.uniform(4, 92) if low else rd.uniform(-4, 250)
        z0 = rd.uniform(5.6, 7.6) if low else rd.uniform(9, 30)
        cu = bpy.data.curves.new(f"cable_v3_{i}", "CURVE"); cu.dimensions = "3D"
        cu.bevel_depth = 0.03
        sp = cu.splines.new("BEZIER"); sp.bezier_points.add(2)
        sag = rd.uniform(0.8, 2.4)
        pts = [(-ST_EDGE, yy, z0), (0, yy + rd.uniform(-1.5, 1.5), z0 - sag), (ST_EDGE, yy + rd.uniform(-3, 3), z0 + rd.uniform(-1.5, 2.5))]
        for bp, p in zip(sp.bezier_points, pts):
            bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
        cu.materials.append(cable_mat)
        link(bpy.data.objects.new(f"cable_v3_{i}", cu), city)
        if (low and i % 3 == 0) or (not low and rd.random() < 0.3):
            mat = rd.choice(lantern_mats)
            n_l = rd.randint(5, 9)
            for k in range(n_l):
                tt = (k + 0.5) / n_l
                x = -ST_EDGE + tt * 2 * ST_EDGE
                s = (1 - (2 * tt - 1) ** 2) * sag * 0.9
                instance(f"lan_v3_{i}_{k}", lantern, mat, signs).location = (x, yy, z0 - s - 0.45)

    # pedestrians on the sidewalks, a few under LED-shaft umbrellas (Blade Runner)
    coat = mat_dark("coat", color=(0.018, 0.018, 0.02, 1), rough=0.45, metal=0.0, grime=0.4)
    brolly = mat_dark("umbrella", color=(0.012, 0.012, 0.014, 1), rough=0.18, metal=0.0)
    person, canopy, shaft = person_meshes()
    shaft_mats = [emit["red"], emit["yellow"], emit["cool"]]
    for i in range(96):
        side = rd.choice((-1, 1))
        y0 = rd.uniform(-6, 250)
        x = side * rd.uniform(7.4, 8.5)
        v = rd.choice((0.0, 0.05, 0.07, 0.09, -0.06, -0.08))
        p = instance(f"ped{i}", person, coat, movers)
        s = rd.uniform(0.92, 1.1)
        p.scale = (s, s, s)
        if rd.random() < 0.42:
            instance(f"brolly{i}", canopy, brolly, movers).parent = p
            if rd.random() < 0.55:
                instance(f"shaft{i}", shaft, rd.choice(shaft_mats), movers).parent = p
        dyn.peds.append((p, x, y0, v))

    # animated LED billboards, slanted towards the street; each throws coloured light on the wet street
    boards = [
        (38.0, -1, 27.0, 9.0, 5.4, "scroll", NEON_RED, NEON_YELLOW, "red"),
        (70.0, 1, 25.0, 9.0, 5.4, "eq", NEON_YELLOW, NEON_RED, "yellow"),
        (122.0, -1, 35.0, 13.0, 7.5, "wave", COOL_WHITE, NEON_RED, "cool"),
        (158.0, 1, 39.0, 13.0, 7.5, "rings", NEON_YELLOW, NEON_RED, "yellow"),
        (204.0, 1, 44.0, 11.0, 40.0, "eq", NEON_RED, NEON_YELLOW, "red"),
        (232.0, -1, 48.0, 15.0, 8.5, "scroll", NEON_YELLOW, NEON_RED, "yellow"),
    ]
    for i, (by, side, bz, bw, bh, kind, ca, cb, spill) in enumerate(boards):
        mat = mat_billboard(f"billboard{i}", kind, ca, cb)
        rz = (math.pi / 2 - 0.7) if side < 0 else -(math.pi / 2 - 0.7)
        nb = Vector((math.sin(rz), -math.cos(rz), 0))
        c = Vector((side * (ST_EDGE + 0.6), by, bz))
        bo = plane(f"billboard{i}", tuple(c), (bw, bh), (math.pi / 2, 0, rz), mat, signs)
        bo["t"] = 0.0
        dyn.billboards.append(bo)
        box(f"billboard_back{i}", tuple(c - nb * 0.25), (bw + 0.6, 0.3, bh + 0.6), board, city).rotation_euler = (0, 0, rz)
        lo = add_light(f"billboard_spill{i}", "AREA", tuple(c + nb * 3.0), SPILL[spill], 1600 if bh < 20 else 4200, lights, size=bw)
        lo.rotation_euler = (math.pi / 2, 0, rz + math.pi)


def person_meshes():
    """Low-poly figures for the crowds: a trench-coat silhouette, an umbrella
    canopy, and the umbrella's shaft (lit on some, like Blade Runner's LED umbrellas)."""
    def mesh_from(build, name):
        me = bpy.data.meshes.new(name)
        bm = bmesh.new()
        build(bm)
        bm.to_mesh(me); bm.free()
        return me

    def person(bm):
        bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=0.30, radius2=0.19, depth=1.25,
                              matrix=Matrix.Translation((0, 0, 1.18)))
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.13, matrix=Matrix.Translation((0, 0, 1.95)))
        for e in (-0.1, 0.1):
            bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.07, radius2=0.08, depth=0.6,
                                  matrix=Matrix.Translation((e, 0, 0.3)))

    def canopy(bm):
        bmesh.ops.create_cone(bm, cap_ends=False, segments=10, radius1=0.62, radius2=0.04, depth=0.32,
                              matrix=Matrix.Translation((0.05, 0, 2.28)))

    def shaft(bm):
        bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.018, radius2=0.018, depth=0.95,
                              matrix=Matrix.Translation((0.05, 0, 1.92)))

    return mesh_from(person, "person"), mesh_from(canopy, "canopy"), mesh_from(shaft, "shaft")


def place_sign(word, ck, style, side, cy, rnd, mat, board, signs, lights, emit):
    spill = SPILL[ck]
    if style == "blade":
        # blade sign projecting from the facade, readable from down the street
        size = rnd.uniform(1.5, 2.2)
        zc = rnd.uniform(11, 22)
        hgt = len(word) * size * 0.86 + 1.4
        px = side * (ST_EDGE - 1.3)
        box(f"bb_{word}", (px, cy, zc - hgt / 2), (1.9, 0.35, hgt), board, signs)
        for e in (-1, 1):  # frame tubes
            box(f"bf_{word}{e}", (px + e * 0.97, cy - 0.2, zc - hgt / 2), (0.07, 0.07, hgt), mat, signs)
        box(f"bft_{word}", (px, cy - 0.2, zc + hgt / 2), (1.95, 0.07, 0.07), mat, signs)
        neon_text(f"sg_{word}", word, size, mat, (px, cy - 0.22, zc), (math.pi / 2, 0, 0),
                  tube=rnd.random() < 0.4, vertical=True, coll=signs)
        add_light(f"spill_{word}", "POINT", (px - side * 1.4, cy - 1.8, zc - 1), spill, 450, lights, size=1.2)
    else:
        # facade sign above the canopy, slanted towards the street
        size = rnd.uniform(1.7, 2.5) if style != "box" else rnd.uniform(1.6, 2.1)
        zc = rnd.uniform(7.0, 10.5)
        width = len(word) * size * 0.55 + 1.8
        px = side * (ST_EDGE - 2.7)
        rz = (math.pi / 2 - 0.75) if side < 0 else -(math.pi / 2 - 0.75)
        nb = Vector((math.sin(rz), -math.cos(rz), 0))  # sign normal (towards camera)
        box(f"br_{word}", (side * (ST_EDGE - 1.3), cy, zc + size * 0.8), (2.6, 0.12, 0.12), board, signs)
        if style == "box":
            # inverted: dark letters on a glowing panel
            plane(f"sp_{word}", tuple(Vector((px, cy, zc)) - nb * 0.08), (width, size * 1.45), (math.pi / 2, 0, rz),
                  mat, signs)
            neon_text(f"sg_{word}", word, size, board, tuple(Vector((px, cy, zc)) + nb * 0.02), (math.pi / 2, 0, rz),
                      coll=signs, extrude=0.06)
        else:
            neon_text(f"sg_{word}", word, size, mat, (px, cy, zc), (math.pi / 2, 0, rz), tube=(style == "tube"), coll=signs)
            plane(f"sb_{word}", tuple(Vector((px, cy, zc)) - nb * 0.06), (width, size * 1.45), (math.pi / 2, 0, rz),
                  board, signs)
            if style == "bulbs":
                # marquee: a border of bulbs (chaser look comes from alternating brightness)
                n_b = int(width / 0.55)
                for k in range(n_b):
                    for e in (-1, 1):
                        off = Vector((math.cos(rz), math.sin(rz), 0)) * (-width / 2 + (k + 0.5) * width / n_b)
                        p = Vector((px, cy, zc + e * size * 0.68)) + off + nb * 0.05
                        box(f"bulb_{word}{k}{e}", tuple(p), (0.16, 0.16, 0.16),
                            emit["warm"] if (k % 2) else emit["yellow"], signs)
        lo = add_light(f"spill_{word}", "AREA", (px - side * 2.5, cy, zc - 1), spill, 380, lights, size=width)
        lo.rotation_euler = (0, -side * math.pi / 2.4, 0)


def build_rail(rnd, dyn, city, movers, lights, emit, concrete, metal, dark):
    """Elevated rail crossing the avenue, with a train that passes overhead as
    the camera goes under it (frames ~25-55 of 120)."""
    deck_w = 7.0
    box("rail_deck", (0, RAIL_Y, RAIL_Z), (420, deck_w, 1.3), concrete, city)
    for e in (-1, 1):
        box(f"rail_parapet{e}", (0, RAIL_Y + e * (deck_w / 2 - 0.15), RAIL_Z + 1.3), (420, 0.3, 1.1), concrete, city)
        box(f"rail_led{e}", (0, RAIL_Y + e * (deck_w / 2 + 0.02), RAIL_Z + 0.2), (420, 0.06, 0.08), emit["led"], city)
        for x in (-9.2, 9.2):  # pillars on the sidewalks
            box(f"rail_pillar{e}{x}", (x, RAIL_Y + e * 1.8, 0), (1.4, 1.4, RAIL_Z), concrete, city)
    # warning lights + warm under-deck lights (light the road and the fog)
    for x in range(-60, 61, 12):
        box(f"rail_under{x}", (x, RAIL_Y, RAIL_Z - 0.06), (2.4, 0.5, 0.06), emit["cool"], city)
    for x in (-5, 5):
        add_light(f"rail_spot{x}", "SPOT", (x, RAIL_Y, RAIL_Z - 0.3), (0.7, 0.86, 1.0), 4500, lights,
                  size=0.4, rot=(0, 0, 0), spot=math.radians(95), blend=0.6)
    box("rail_sign_bg", (0, RAIL_Y - deck_w / 2 - 0.2, RAIL_Z + 0.15), (18, 0.2, 1.1), emit["yellow_dim"], city)
    # the train: an empty carrying 6 cars
    train = bpy.data.objects.new("train", None)
    link(train, movers)
    car_l, gap = 17.0, 0.8
    for i in range(6):
        cx = i * (car_l + gap) + car_l / 2
        for part in (
            box(f"car_body{i}", (cx, 0, 0.3), (car_l, 3.0, 3.1), metal, movers),
            box(f"car_win{i}", (cx, 0, 1.55), (car_l - 1.2, 3.04, 0.9), emit["window_train"], movers),
            box(f"car_stripe{i}", (cx, 0, 0.9), (car_l - 0.4, 3.05, 0.14), emit["red"], movers),
        ):
            part.parent = train
    head = box("train_head", (-0.3, 0, 1.2), (0.3, 2.2, 0.5), emit["head"], movers)
    head.parent = train
    hl = add_light("train_beam", "SPOT", (-0.5, 0, 1.4), (1.0, 0.85, 0.7), 60000, lights, size=0.3,
                   rot=(0, math.pi / 2, 0), spot=math.radians(28), blend=0.4)  # along -X, the way it travels
    hl.parent = train
    dyn.train = train


def build_bridge(city, lights, emit, concrete, tower_cool):
    """A glazed skybridge across the avenue that the camera slips under."""
    box("bridge", (0, BRIDGE_Y, 26.0), (2 * ST_EDGE + 6, 6.0, 3.6), tower_cool, city)
    box("bridge_floor", (0, BRIDGE_Y, 25.6), (2 * ST_EDGE + 6, 6.6, 0.4), concrete, city)
    for e in (-1, 1):
        box(f"bridge_led{e}", (0, BRIDGE_Y + e * 3.35, 25.62), (2 * ST_EDGE + 6, 0.06, 0.06), emit["led"], city)
    add_light("bridge_under", "AREA", (0, BRIDGE_Y, 25.4), (0.7, 0.86, 1.0), 2200, lights, size=10, rot=(0, 0, 0))


def build_holograms(dyn, signs, lights):
    """Two giant see-through holograms the camera banks past: the handle on the
    left, a slowly turning wireframe globe on the right (the rare cyan accent)."""
    red = mat_holo("holo_red", NEON_RED, strength=4.2, alpha=0.6)
    yel = mat_holo("holo_yellow", NEON_YELLOW, strength=3.0, alpha=0.5)
    cyan = mat_holo("holo_cyan", CYAN, strength=2.6, alpha=0.5)
    dyn.holo_mats += [red.name, yel.name, cyan.name]
    # CHIDS, hanging in the air over the left lanes; the camera flies under it
    hx, hy, hz = -6.5, 178.0, 35.0
    rz = math.radians(14)
    neon_text("holo_chids", "CHIDS", 7.5, red, (hx, hy, hz), (math.pi / 2, 0, rz), coll=signs, spacing=1.05, extrude=0.0)
    frame = bpy.data.objects.new("holo_frame", None); link(frame, signs)
    frame.location = (hx, hy, hz); frame.rotation_euler = (0, 0, rz)
    for k, (w_, h_, z_) in enumerate([(24, 0.2, 5.4), (24, 0.2, -5.6)]):
        b = box(f"holo_frame{k}", (0, 0, z_), (w_, 0.05, h_), yel, signs)
        b.parent = frame
    plate = plane("holo_plate", (hx, hy + 0.3, hz), (24, 10.5), (math.pi / 2, 0, rz), mat_holo("holo_plate", NEON_RED, 0.22, 0.08, glow=0.05), signs)
    dyn.holo_mats.append(plate.data.materials[0].name)
    add_light("holo_chids_glow", "POINT", (hx + 2, hy - 4, hz), SPILL["red"], 4000, lights, size=5)
    # wireframe globe on the right
    me = bpy.data.meshes.new("globe")
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=6.5)
    bm.to_mesh(me); bm.free()
    me.materials.append(cyan)
    globe = link(bpy.data.objects.new("holo_globe", me), signs)
    globe.location = (12.5, 228.0, 58.0)  # above the right sidewalk; the camera passes below-left
    wm = globe.modifiers.new("wire", "WIREFRAME"); wm.thickness = 0.09; wm.use_replace = True
    dyn.holo_spin.append(globe)
    ring = bpy.data.meshes.new("ring")
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, radius=9.5, segments=96)
    bm.to_mesh(ring); bm.free()
    ring.materials.append(yel)
    ro = link(bpy.data.objects.new("holo_ring", ring), signs)
    ro.location = globe.location; ro.rotation_euler = (math.radians(74), 0, 0)
    sk = ro.modifiers.new("skin", "WIREFRAME"); sk.thickness = 0.18
    dyn.holo_spin.append(ro)
    add_light("holo_globe_glow", "POINT", (11.0, 224.0, 58.0), SPILL["cyan"], 9000, lights, size=5)


def build_climb(rnd, dyn, city, signs, lights, emit, tower, tower_cool, board, concrete):
    """The rise at the end of the avenue. Instead of a wall: the flanking towers'
    corners and terraces recede on both sides, a glazed skybridge drops away
    below the camera, and a low block further back carries a giant screen tuned
    to the radio from the Night City page."""
    # skybridge between the last towers; the camera rises past it
    box("bridge2", (0, 256.0, 52.0), (2 * ST_EDGE + 8, 7.0, 4.2), tower_cool, city)
    box("bridge2_floor", (0, 256.0, 51.6), (2 * ST_EDGE + 8, 7.6, 0.4), concrete, city)
    for e in (-1, 1):
        box(f"bridge2_led{e}", (0, 256.0 + e * 3.85, 51.62), (2 * ST_EDGE + 8, 0.06, 0.06), emit["led"], city)
        box(f"bridge2_red{e}", (0, 256.0 + e * 3.55, 56.2), (2 * ST_EDGE + 8, 0.06, 0.06), emit["red_dim"], city)
    # terraces on the last towers: stepped balconies with lit edges and railings (parallax on the way up)
    for side in (-1, 1):
        for k, z in enumerate((34.0, 46.0, 58.0, 70.0)):
            depth = 2.2 + 0.6 * k
            box(f"terrace{side}{k}", (side * (ST_EDGE - depth / 2 + 0.2), 236.0 + 6 * k, z), (depth, 14.0, 0.5), concrete, city)
            box(f"terrace_led{side}{k}", (side * (ST_EDGE - depth + 0.25), 236.0 + 6 * k, z - 0.08), (0.08, 14.0, 0.08),
                emit["led" if k % 2 else "yellow_dim"], city)
            for j in range(4):
                box(f"rail{side}{k}{j}", (side * (ST_EDGE - depth + 0.3), 230.5 + 6 * k + j * 3.6, z + 0.5), (0.08, 0.08, 1.1), board, city)
    # the screen block, low enough to drop out of the final frame
    bw, bd, bh = 64.0, 18.0, 64.0
    box("screen_block", (0, SCREEN_Y + bd / 2, 0), (bw, bd, bh), tower, city)
    box("screen_block_led", (0, SCREEN_Y - 0.1, bh - 0.4), (bw, 0.1, 0.12), emit["led"], city)
    sw, sh = 46.0, 24.0
    scr_z = bh - 6 - sh / 2
    screen = mat_holo("gate_screen", NEON_RED, strength=1.1, alpha=1.0, glow=0.25)
    plane("gate_screen", (0, SCREEN_Y - 0.15, scr_z), (sw, sh), (math.pi / 2, 0, 0), screen, city)
    dyn.holo_mats.append(screen.name)
    box("gate_screen_frame_t", (0, SCREEN_Y - 0.2, scr_z + sh / 2), (sw + 0.6, 0.12, 0.3), emit["yellow"], city)
    box("gate_screen_frame_b", (0, SCREEN_Y - 0.2, scr_z - sh / 2 - 0.3), (sw + 0.6, 0.12, 0.3), emit["yellow"], city)
    neon_text("gate_fm", "CHIDS FM", 8.0, emit["yellow"], (0, SCREEN_Y - 0.45, scr_z + 3.2), (math.pi / 2, 0, 0),
              coll=city, spacing=1.08)
    neon_text("gate_freq", "97.8  //  ON AIR", 2.6, emit["warm"], (0, SCREEN_Y - 0.45, scr_z - 5.6), (math.pi / 2, 0, 0),
              fontfile=FONT_SUB, coll=city, spacing=1.5)
    add_light("screen_glow", "AREA", (0, SCREEN_Y - 8, scr_z), (1.0, 0.18, 0.06), 2400, lights, size=40,
              rot=(math.radians(-90), 0, 0))


def build_mega(rnd, dyn, city, signs, lights, emit, mega_mat, board, tower, tower_cool):
    cy = END_Y + 30
    box("mega", (0, cy, 0), (70, 40, 160), mega_mat, city)
    box("mega_t2", (0, cy + 2, 160), (54, 32, 80), mega_mat, city)
    box("mega_t3", (0, cy + 4, 240), (36, 22, 40), mega_mat, city)
    box("mega_spire", (0, cy + 4, 280), (1.6, 1.6, 60), emit["red"], city)
    for zz, ww in ((160, 70), (240, 54), (280, 36)):
        box(f"mega_edge{zz}", (0, MEGA_FACE - 0.1 + (0 if zz == 160 else 4 if zz == 240 else 9), zz - 0.4), (ww, 0.2, 0.3), emit["yellow_dim"], city)
    gz = SIGN_Z
    box("giant_board", (0, MEGA_FACE, gz - 13), (60, 0.6, 26), board, signs)
    neon_text("giant_night", "NIGHT CITY", 13.0, emit["giant"], (0, MEGA_FACE - 0.6, gz + 2.5), (math.pi / 2, 0, 0),
              coll=signs, spacing=1.08)
    neon_text("giant_handle", "WELCOME, CHOOM", 3.3, emit["giant_y"], (0, MEGA_FACE - 0.6, gz - 8.5), (math.pi / 2, 0, 0),
              fontfile=FONT_SUB, coll=signs, spacing=1.6)
    for e in (-1, 1):
        box(f"giant_rule{e}", (e * 17, MEGA_FACE - 0.6, gz - 8.4), (14, 0.2, 0.22), emit["red"], signs)
        box(f"giant_post{e}", (e * 30.2, MEGA_FACE - 0.4, gz - 13), (0.35, 0.3, 26), emit["yellow_dim"], signs)
        for k in range(3):
            box(f"mega_rib{e}{k}", (e * (34.6 - k * 1.2), MEGA_FACE + 0.3, 0), (0.25, 0.25, 160 - k * 30), emit["red_dim"], signs)
    box("giant_top", (0, MEGA_FACE - 0.4, gz + 13), (60.6, 0.3, 0.35), emit["yellow_dim"], signs)
    box("giant_bot", (0, MEGA_FACE - 0.4, gz - 13.35), (60.6, 0.3, 0.35), emit["yellow_dim"], signs)
    for k in range(6):
        box(f"mega_band{k}", (0, MEGA_FACE + 0.25, 20 + k * 28), (70.2, 0.3, 1.4), board, city)
    add_light("giant_spill", "AREA", (0, MEGA_FACE - 14, gz - 4), (1, 0.12, 0.05), 38000, lights, size=40,
              rot=(math.radians(72), 0, 0))
    # searchlights on the crown, sweeping the smog
    for i, (x, phase) in enumerate(((-15, 0.0), (0, 2.1), (15, 4.2))):
        lamp = box(f"search_head{i}", (x, cy + 4, 280), (1.2, 1.2, 0.8), emit["led"], city)
        lo = add_light(f"search{i}", "SPOT", (x, cy + 2, 281.5), (1.0, 0.92, 0.8), 4.0e6, lights, size=0.4,
                       spot=math.radians(2.6), blend=0.15)
        lo.rotation_mode = "XYZ"
        dyn.searchlights.append((lo, phase))
    # two more from the far skyline
    for i, (x, y_, z_, phase) in enumerate(((-140, 420, 160, 1.0), (150, 460, 180, 3.0))):
        lo = add_light(f"search_far{i}", "SPOT", (x, y_, z_), (1.0, 0.85, 0.6), 3.0e6, lights, size=0.4,
                       spot=math.radians(2.2), blend=0.15)
        lo.rotation_mode = "XYZ"
        dyn.searchlights.append((lo, phase))
    # flanking skyline behind, so the end of the street isn't a wall
    for i in range(22):
        x = rnd.uniform(-300, 300)
        if abs(x) < 48:
            continue
        hh = rnd.uniform(90, 260)
        cyy = END_Y + rnd.uniform(30, 220)
        box(f"far{i}", (x, cyy, 0), (rnd.uniform(20, 45), rnd.uniform(20, 45), hh), tower_cool if rnd.random() < 0.4 else tower, city)
        if rnd.random() < 0.6:
            b = box(f"far_beacon{i}", (x, cyy, hh), (1.2, 1.2, 1.2), emit["beacon"], signs)
            dyn.beacons.append((b, rnd.random()))


def build_street(rnd, dyn, city, signs, lights, movers, emit, dark, metal):
    # cables strung across the street (sagging bezier curves), low enough that
    # the camera passes under them on the street-level stretch
    cable_mat = mat_dark("cable", color=(0.004, 0.004, 0.004, 1), rough=0.6, metal=0.0)
    for i in range(18):
        yy = rnd.uniform(6, RAIL_Y - 6)
        z0 = rnd.uniform(10, 21)
        cu = bpy.data.curves.new(f"cable{i}", "CURVE"); cu.dimensions = "3D"
        cu.bevel_depth = 0.035
        sp = cu.splines.new("BEZIER"); sp.bezier_points.add(2)
        pts = [(-ST_EDGE, yy, z0), (0, yy + rnd.uniform(-1, 1), z0 - rnd.uniform(1.5, 3.5)),
               (ST_EDGE, yy + rnd.uniform(-2, 2), z0 + rnd.uniform(-2, 2))]
        for bp, p in zip(sp.bezier_points, pts):
            bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
        cu.materials.append(cable_mat)
        link(bpy.data.objects.new(f"cable{i}", cu), city)
        if rnd.random() < 0.4:
            for k in range(7):
                t = (k + 1) / 8
                x = -ST_EDGE + t * 2 * ST_EDGE
                sag = (1 - (2 * t - 1) ** 2) * 2.2
                box(f"lan{i}_{k}", (x, yy, z0 - sag - 0.6), (0.35, 0.35, 0.45), emit[rnd.choice(["red", "yellow"])], signs)

    # cool LED street lamps: the main light in the low smog, so the haze reads steel-teal
    for side in (-1, 1):
        for yy in range(10, int(STREET_END), 24):
            yy += side * 6
            px = side * (ROAD_HALF + 0.6)
            box(f"pole{side}{yy}", (px, yy, 0), (0.18, 0.18, 8.2), metal, city)
            box(f"arm{side}{yy}", (px - side * 1.2, yy, 8.0), (2.4, 0.15, 0.15), metal, city)
            box(f"lamp{side}{yy}", (px - side * 2.1, yy, 7.85), (0.9, 0.35, 0.12), emit["cool"], city)
            add_light(f"sl{side}{yy}", "SPOT", (px - side * 2.1, yy, 7.6), (0.66, 0.84, 1.0), 2600, lights,
                      size=0.4, spot=math.radians(100), blend=0.5)

    # street steam: vents on the sidewalks, each lit from below by a coloured lamp
    for i, (x, y_, col) in enumerate(((-8.6, 26, "cool"), (8.4, 52, "yellow"), (-8.2, 80, "cool"),
                                       (8.8, 118, "red"), (-8.6, 150, "cool"), (8.4, 196, "cool"))):
        m = mat_steam(i)
        ob = box(f"steam{i}", (x, y_, 0.1), (5.0, 5.0, 16.0), m, signs)
        ob["volume_only"] = True
        ob["rise"] = 0.0
        dyn.steam_obs.append(ob)
        add_light(f"steam_lamp{i}", "POINT", (x, y_, 0.6), SPILL[col], 1500, lights, size=0.5)

    # wet black car paint and dark glass: reads as sleek shapes catching the neon, not boxes
    paint = mat_dark("car_paint", color=(0.006, 0.006, 0.007, 1), rough=0.16, metal=0.5)
    glass = mat_dark("car_glass", color=(0.002, 0.002, 0.003, 1), rough=0.05, metal=0.2)
    # traffic: tail lights (away, right lanes) and head lights (towards us, left lanes),
    # each trailing a faint streak that sells the speed
    for i in range(30):
        y0 = rnd.uniform(-10, END_Y - 40)
        lane_x = rnd.choice([-4.8, -4.4, 4.4, 4.8])
        away = lane_x > 0
        v = rnd.uniform(0.55, 0.95) * (1 if away else -1.1)
        if -16 < y0 + v < 10:  # nothing right beside the camera on the first frames (it's the poster)
            y0 += 30
        car = bpy.data.objects.new(f"car{i}", None); link(car, movers)
        for part in (box(f"cb{i}", (0, 0, 0.3), (1.9, 4.4, 0.75), paint, movers),
                     box(f"cc{i}", (0, 0.3, 1.05), (1.6, 2.2, 0.55), glass, movers)):
            part.parent = car
        lm = emit["tail"] if away else emit["head"]
        end = -2.21 if away else 2.21
        for e in (-1, 1):
            b = box(f"cl{i}{e}", (e * 0.7, end, 0.8), (0.38, 0.04, 0.1), lm, movers); b.parent = car
            if away:  # a faint tail-light trail sells the speed
                s = box(f"cs{i}{e}", (e * 0.7, end - 2.6, 0.84), (0.06, 5.0, 0.04), emit["tail_streak"], movers); s.parent = car
        dyn.cars.append((car, lane_x, y0, v))


def build_avs(dyn, movers, lights, emit, dark):
    """Flying cars (AVs): a dark body with head and tail lights and a beam into
    the smog. Paths are straight lines in time, chosen to cross the shot."""
    paths = [
        # (start xyz, end xyz, frame window as fraction of the shot)
        ((6.0, 30.0, 22.0), (2.0, 260.0, 30.0), (0.0, 0.55)),       # ahead of us, pulling away down the avenue
        ((120.0, 176.0, 44.0), (-120.0, 168.0, 40.0), (0.35, 0.75)),  # crossing in front of the CHIDS hologram
        ((-14.0, 360.0, 70.0), (-6.0, 150.0, 58.0), (0.45, 1.0)),    # coming towards us high up
        ((-160.0, 330.0, 112.0), (160.0, 345.0, 118.0), (0.7, 1.0)),  # crossing in front of the mega-tower
        ((90.0, 420.0, 150.0), (40.0, 300.0, 140.0), (0.6, 1.0)),    # far, high
        ((-70.0, 262.0, 74.0), (70.0, 270.0, 66.0), (0.64, 0.86)),    # crossing just in front during the climb
    ]
    for i, (a, b, win) in enumerate(paths):
        av = bpy.data.objects.new(f"av{i}", None); link(av, movers)
        d = Vector(b) - Vector(a)
        av.rotation_euler = (0, 0, math.atan2(d.y, d.x) - math.pi / 2)
        parts = [box(f"avb{i}", (0, 0, -0.4), (2.4, 5.2, 1.0), dark, movers),
                 box(f"avc{i}", (0, 0.4, 0.5), (1.8, 2.6, 0.6), dark, movers),
                 box(f"avh{i}", (0, 2.62, 0.0), (1.8, 0.06, 0.18), emit["head"], movers),
                 box(f"avt{i}", (0, -2.62, 0.0), (2.0, 0.06, 0.16), emit["tail"], movers),
                 box(f"avu{i}", (0, 0, -0.45), (1.6, 3.6, 0.04), emit["red_dim"], movers)]
        for p in parts:
            p.parent = av
        beam = add_light(f"av_beam{i}", "SPOT", (0, 2.7, 0.0), (1.0, 0.9, 0.75), 40000, lights, size=0.2,
                         rot=(math.radians(78), 0, 0), spot=math.radians(14), blend=0.4)  # forward, slightly down
        beam.parent = av
        dyn.avs.append((av, Vector(a), Vector(b), win))


def build_rain(scene, cam, rnd, n=520):
    """Thin streaks parented to the camera; the sheet falls a bit each frame."""
    rain = bpy.data.collections.new("rain"); scene.collection.children.link(rain)
    mat = mat_rain()
    me = bpy.data.meshes.new("rain_mesh")
    verts, faces = [], []
    for i in range(n):
        x = rnd.uniform(-10, 10)
        y = rnd.uniform(-7, 13)
        z = -rnd.uniform(3.0, 28)
        ln = rnd.uniform(0.4, 0.9)
        wdt = 0.004 + 0.0005 * -z
        sl = 0.08
        b = len(verts)
        verts += [(x - wdt, y, z), (x + wdt, y, z), (x + wdt + sl * ln, y + ln, z), (x - wdt + sl * ln, y + ln, z)]
        faces.append((b, b + 1, b + 2, b + 3))
    me.from_pydata(verts, [], faces)
    me.materials.append(mat)
    ob = bpy.data.objects.new("rain", me)
    ob.parent = cam
    link(ob, rain)
    return ob


def build_smog(scene):
    vol = bpy.data.collections.new("volume"); scene.collection.children.link(vol)
    me = bpy.data.meshes.new("smog_domain")
    v = [(-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0), (-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1)]
    f = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me.from_pydata(v, [], f)
    me.update()
    me.materials.append(mat_smog())
    ob = bpy.data.objects.new("smog", me)
    ob.location = (0, 290, 0)
    ob.scale = (320, 360, 420)
    ob["volume_only"] = True
    link(ob, vol)
    return ob


# --------------------------------------------------------------------------
# Camera move: a monotone cubic through key poses (no overshoot), on a gently
# eased clock. Roll is applied around the view axis.
# --------------------------------------------------------------------------
def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * t * (t * (t * 6 - 15) + 10)


def lerp(a, b, t):
    return a + (b - a) * t


def pchip(ts, vs, t):
    """Fritsch-Carlson monotone cubic interpolation of vs over ts at t."""
    n = len(ts)
    if t <= ts[0]:
        return vs[0]
    if t >= ts[-1]:
        return vs[-1]
    h = [ts[i + 1] - ts[i] for i in range(n - 1)]
    dl = [(vs[i + 1] - vs[i]) / h[i] for i in range(n - 1)]
    m = [0.0] * n
    m[0], m[-1] = dl[0], dl[-1]
    for i in range(1, n - 1):
        if dl[i - 1] * dl[i] <= 0:
            m[i] = 0.0
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i])
    i = max(k for k in range(n - 1) if ts[k] <= t)
    s = (t - ts[i]) / h[i]
    h00 = 2 * s ** 3 - 3 * s ** 2 + 1
    h10 = s ** 3 - 2 * s ** 2 + s
    h01 = -2 * s ** 3 + 3 * s ** 2
    h11 = s ** 3 - s ** 2
    return h00 * vs[i] + h10 * h[i] * m[i] + h01 * vs[i + 1] + h11 * h[i] * m[i + 1]


# key poses: (time, camera xyz, target xyz, roll degrees, lens desktop, lens mobile)
KEYS = [
    (0.00, (-1.6, -8.0, 1.6), (-0.8, 60.0, 5.5), 5.0, 24, 15),
    (0.17, (1.0, 45.0, 2.4), (0.4, 140.0, 9.0), 2.5, 24, 15),
    (0.31, (0.6, 99.0, 7.0), (-2.0, 185.0, 17.0), -1.5, 23, 15),   # under the rail as the train crosses
    (0.44, (-3.2, 140.0, 16.5), (-6.0, 190.0, 30.0), -6.5, 22, 14),  # under the skybridge, banking towards CHIDS
    (0.58, (2.4, 196.0, 30.0), (8.0, 262.0, 44.0), 5.0, 22, 14),    # past the globe
    (0.71, (-2.5, 230.0, 46.0), (16.0, 300.0, 62.0), 7.0, 22, 15),  # climbing; looking right, tower corners recede
    (0.85, (-0.8, 248.0, 80.0), (6.0, 340.0, 104.0), 2.5, 25, 18),  # the skybridge drops away, the sign rises
    (1.00, (0.0, 262.0, 108.0), (0.0, MEGA_FACE, 124.0), 0.0, 27, 20),
]


def clock(t):
    # mostly linear, eased at both ends
    return 0.65 * t + 0.35 * (0.5 - 0.5 * math.cos(math.pi * t))


def cam_pose(t, mobile):
    u = clock(t)
    ts = [k[0] for k in KEYS]
    pos = Vector([pchip(ts, [k[1][j] for k in KEYS], u) for j in range(3)])
    tgt = Vector([pchip(ts, [k[2][j] for k in KEYS], u) for j in range(3)])
    roll = pchip(ts, [k[3] for k in KEYS], u)
    lens = pchip(ts, [k[5 if mobile else 4] for k in KEYS], u)
    if mobile:
        # portrait: aim a touch lower early (more road and signs in the tall frame)
        tgt.z -= 2.0 * (1 - smoothstep(0.5, 0.9, t))
    return pos, tgt, roll, lens


def set_camera(cam, t, mobile):
    pos, tgt, roll, lens = cam_pose(t, mobile)
    fwd = (tgt - pos).normalized()
    q = fwd.to_track_quat("-Z", "Y") @ Quaternion((0, 0, 1), math.radians(roll))
    cam.rotation_mode = "QUATERNION"
    cam.location = pos
    cam.rotation_quaternion = q
    cam.data.lens = lens


# --------------------------------------------------------------------------
# Per-frame state
# --------------------------------------------------------------------------
def hash01(*xs):
    h = 0
    for x in xs:
        h = (h * 1000003) ^ int(x * 1000)
    h = (h * 2654435761) & 0xFFFFFFFF
    return h / 0xFFFFFFFF


def set_attr(obs, key, value):
    for ob in obs:
        if ob.get(key) != value:
            ob[key] = value
            ob.update_tag(refresh={"OBJECT"})


def collect_attr_objects(dyn):
    """Map each attribute-driven material to the objects that use it, and give
    those objects their default attribute values."""
    names = set(dyn.holo_mats) | {m for m, _ in dyn.flickers}
    for ob in bpy.data.objects:
        mats = [sl.material for sl in ob.material_slots if sl.material]
        for m in mats:
            if m.name in names:
                dyn.attr_obs.setdefault(m.name, []).append(ob)
                if m.name in dyn.holo_mats:
                    ob["scan"] = 0.0; ob["hflick"] = 1.0
                else:
                    ob["flick"] = 1.0
    for ob, _ in dyn.beacons:
        ob["base_scale"] = tuple(ob.scale)


def apply_frame(dyn, f, frames, mobile):
    t = (f - 1) / max(1, frames - 1)
    # time in "desktop frames", so the mobile sequence shows the same moments
    td = 1 + t * 119
    set_camera(dyn.cam, t, mobile)
    dyn.rain.location = (0.0, -((td * 2.7) % 6.5), 0.0)
    # train: head crosses the avenue centre at about frame 34 of 120
    dyn.train.location = (150 - 4.6 * (td - 1), RAIL_Y, RAIL_Z + 1.35)
    # traffic
    for car, x, y0, v in dyn.cars:
        y = y0 + v * td
        span = END_Y + 30
        y = (y + 30) % span - 30
        car.location = (x, y, 0.0)
        car.rotation_euler = (0, 0, 0 if v > 0 else math.pi)
    # flying cars
    for av, a, b, (w0, w1) in dyn.avs:
        k = max(0.0, min(1.0, (t - w0) / (w1 - w0)))
        inside = w0 - 0.02 <= t <= w1 + 0.02
        av.location = a.lerp(b, k) if inside else Vector((0, 0, -2000))  # parked out of sight
    # neon stutter: mostly on, occasionally dropping out for a frame or two
    for mname, seed in dyn.flickers:
        r = hash01(seed, td // 2)
        set_attr(dyn.attr_obs.get(mname, []), "flick", 0.06 if r < 0.12 else 0.45 if r < 0.2 else 1.0)
    for ob, phase in dyn.beacons:
        on = math.sin(td * 0.35 + phase * 6.28) > 0.3
        ob.scale = tuple(ob["base_scale"]) if on else (1e-4, 1e-4, 1e-4)
    # holograms: scanlines scroll, a rare glitch dims them
    for i, mname in enumerate(dyn.holo_mats):
        g = hash01(i * 7 + 3, td)
        obs = dyn.attr_obs.get(mname, [])
        set_attr(obs, "scan", td * 0.18)
        set_attr(obs, "hflick", 0.35 if g < 0.06 else 1.0)
    for ob in dyn.holo_spin:
        ob.rotation_euler.z = td * 0.012 + (0.6 if ob.name == "holo_ring" else 0.0)
    # searchlights sweep
    for lo, phase in dyn.searchlights:
        yaw = 0.55 * math.sin(td * 0.045 + phase)
        tilt = math.radians(22 + 8 * math.sin(td * 0.031 + phase * 1.7))
        # spot points down -Z: flip it up, then tip it towards the camera side
        lo.rotation_euler = (math.pi + tilt, 0.0, yaw)
    set_attr(dyn.steam_obs, "rise", -td * 0.06)
    # LED billboards animate on their own clock; pedestrians stroll (wrapping along the block)
    set_attr(dyn.billboards, "t", td)
    for ob, x, y0, v in dyn.peds:
        y = (y0 + v * td + 8) % 262 - 8
        ob.location = (x, y, 0.16)
        ob.rotation_euler = (0, 0, 0 if v >= 0 else math.pi)


# --------------------------------------------------------------------------
# Render setup
# --------------------------------------------------------------------------
def setup(args, pass_name="beauty"):
    scene = reset_scene()
    global _PASS_GROUP
    _PASS_GROUP = None
    rnd = random.Random(2077)
    mobile = args.res == "mobile"
    scene.render.engine = "CYCLES"
    cy = scene.cycles
    cy.device = "CPU"
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.05
    cy.use_denoising = True
    try:
        cy.denoiser = "OPENIMAGEDENOISE"
    except Exception:
        pass
    cy.max_bounces = 4
    cy.diffuse_bounces = 1
    cy.glossy_bounces = 1
    cy.transmission_bounces = 1
    cy.transparent_max_bounces = 6
    cy.volume_bounces = 0
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.sample_clamp_indirect = 6.0
    if hasattr(cy, "use_light_tree"):
        cy.use_light_tree = True
    scene.render.threads_mode = "AUTO"
    scene.render.use_persistent_data = True
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "AgX" if "AgX" in [i.identifier for i in scene.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
    try:
        scene.view_settings.look = "AgX - High Contrast"
    except Exception:
        try:
            scene.view_settings.look = "Medium High Contrast"
        except Exception:
            pass
    scene.view_settings.exposure = 0.0
    scene.frame_start = 1
    scene.frame_end = args.frames

    world = mat_world(scene)
    dyn = Dyn()
    build_city(scene, rnd, dyn)
    smog = build_smog(scene)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 24
    cam_data.clip_end = 3000
    cam_data.sensor_fit = "AUTO"
    cam = bpy.data.objects.new("cam", cam_data)
    link(cam)
    scene.camera = cam
    dyn.cam = cam
    dyn.rain = build_rain(scene, cam, rnd)
    collect_attr_objects(dyn)
    set_pass(scene, args, pass_name, world, smog, dyn)
    return scene, dyn


def set_pass(scene, args, pass_name, world, smog, dyn):
    mobile = args.res == "mobile"
    vol = pass_name == "volume"
    W, H = (540, 960) if mobile else (1280, 720)
    if vol:
        # quarter resolution: fog is soft, so this is plenty
        scene.render.resolution_x, scene.render.resolution_y = W // 4, H // 4
        scene.render.resolution_percentage = 100
        scene.cycles.samples = args.samples or 16
        scene.cycles.volume_bounces = 0
        scene.cycles.volume_step_rate = 4.0
        scene.cycles.volume_max_steps = 128
        # ray-marched volumes: the unbiased path rebuilds its acceleration over the whole
        # smog domain on every object update (~25 s a frame here); this is ~1 s
        if hasattr(scene.cycles, "volume_biased"):
            scene.cycles.volume_biased = True
        scene.view_settings.view_transform = "Standard"
        try:
            scene.view_settings.look = "None"
        except Exception:
            pass
    else:
        scene.render.resolution_x, scene.render.resolution_y = W, H
        scene.render.resolution_percentage = args.scale
        scene.cycles.samples = args.samples or 8
    _PASS_GROUP.nodes["volume_pass"].outputs[0].default_value = 1.0 if vol else 0.0
    world.node_tree.nodes["volume_pass"].outputs[0].default_value = 1.0 if vol else 0.0
    # in the volume pass the sky only lights the smog: brighter, so the haze reads cool teal
    # beauty: an overcast fill so the dull surfaces read (wet concrete, brick), not pure black
    world.node_tree.nodes["sky"].inputs["Strength"].default_value = 9.0 if vol else 1.7
    for ob in bpy.data.objects:
        if ob.get("volume_only"):
            ob.hide_render = not vol
    dyn.rain.hide_render = vol


def render(args):
    scene, dyn = setup(args, args.pass_)
    mobile = args.res == "mobile"
    os.makedirs(args.out, exist_ok=True)
    end = args.end or args.frames
    for f in range(args.start, end + 1):
        t0 = time.time()
        scene.frame_set(f)
        apply_frame(dyn, f, args.frames, mobile)
        scene.render.filepath = os.path.join(args.out, f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"{args.pass_} frame {f}/{end} {time.time() - t0:.1f}s", flush=True)
    if args.blend:
        bake_keys(scene, dyn, args.frames, mobile)
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))


def bake_keys(scene, dyn, frames, mobile):
    """Bake the per-frame state to keyframes so the saved .blend plays in Blender."""
    obs = [dyn.cam, dyn.rain, dyn.train] + [c[0] for c in dyn.cars] + [a[0] for a in dyn.avs] + dyn.holo_spin \
        + [s[0] for s in dyn.searchlights] + [pd[0] for pd in dyn.peds]
    for f in range(1, frames + 1):
        apply_frame(dyn, f, frames, mobile)
        for ob in obs:
            ob.keyframe_insert("location", frame=f)
            ob.keyframe_insert("rotation_quaternion" if ob.rotation_mode == "QUATERNION" else "rotation_euler", frame=f)
        dyn.cam.data.keyframe_insert("lens", frame=f)


def still(args):
    scene, dyn = setup(args, args.pass_)
    scene.frame_set(args.frame)
    apply_frame(dyn, args.frame, args.frames, args.res == "mobile")
    scene.render.filepath = args.out
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"still {args.pass_} frame {args.frame} {time.time() - t0:.1f}s", flush=True)


def look(args):
    """Look-dev: both passes for a few frames, then post, into args.out."""
    frames = [int(x) for x in args.frames_list.split(",")]
    for p in ("beauty", "volume"):
        scene, dyn = setup(args, p)
        d = os.path.join(args.out, p)
        os.makedirs(d, exist_ok=True)
        for f in frames:
            t0 = time.time()
            scene.frame_set(f)
            apply_frame(dyn, f, args.frames, args.res == "mobile")
            scene.render.filepath = os.path.join(d, f"{f:04d}.png")
            bpy.ops.render.render(write_still=True)
            print(f"look {p} frame {f} {time.time() - t0:.1f}s", flush=True)
    a = argparse.Namespace(**vars(args))
    a.src = args.out
    a.dst = os.path.join(args.out, "post")
    a.size = "540x960" if args.res == "mobile" else "1280x720"
    a.total = args.frames
    post(a)


# --------------------------------------------------------------------------
# Post: add the volume pass, bloom + anamorphic streaks on the highlights,
# slight chromatic aberration, the v3 grade (a dull, desaturated base with
# smoky lifted blacks; the lights keep their colour), vignette, quiet bands for
# the overlaid copy in the last quarter. PNG for the video encode (no grain:
# noise is expensive in video, the page can add it), or WebP.
# --------------------------------------------------------------------------
def post(args):
    import numpy as np
    from PIL import Image, ImageFilter

    src_b = os.path.join(args.src, "beauty")
    src_v = os.path.join(args.src, "volume")
    os.makedirs(args.dst, exist_ok=True)
    files = sorted(f for f in os.listdir(src_b) if f.endswith(".png"))
    total = getattr(args, "total", 0) or len(files)
    tw, th = (int(v) for v in args.size.lower().split("x")) if args.size else (None, None)

    def lin(a):
        return np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)

    def enc(a):
        a = np.clip(a, 0, 1)
        return np.where(a <= 0.0031308, a * 12.92, 1.055 * np.power(a, 1 / 2.4) - 0.055)

    def hblur(img, r):
        # horizontal box blur x3 (anamorphic streak) on a small image
        a = img
        for _ in range(3):
            c = np.cumsum(np.pad(a, ((0, 0), (r + 1, r), (0, 0)), mode="edge"), axis=1)
            a = (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)
        return a

    for name in files:
        frame = int(name[:4])
        im = Image.open(os.path.join(src_b, name)).convert("RGB")
        w, h = (tw, th) if tw else im.size
        if im.size != (w, h):
            im = im.resize((w, h), Image.LANCZOS)
        a = lin(np.asarray(im).astype(np.float32) / 255.0)
        vp = os.path.join(src_v, name)
        if os.path.exists(vp):
            v = Image.open(vp).convert("RGB").resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(w / 640))
            a = a + lin(np.asarray(v).astype(np.float32) / 255.0) * args.vol_gain
        # bloom (screen-blended in display space) from the bright parts
        disp = enc(a)
        luma = disp @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        hi = (np.clip((luma - 0.5) / 0.5, 0, 1) ** 1.5)[..., None] * disp
        hi_im = Image.fromarray((np.clip(hi, 0, 1) * 255).astype(np.uint8))
        t = (frame - 1) / max(1, total - 1)
        end = np.clip((t - 0.62) / 0.25, 0, 1)
        end = end * end * (3 - 2 * end)  # 0 on the street, 1 over the skyline
        glow = np.zeros_like(disp)
        for r, wgt in ((max(2, w // 300), 0.6), (max(4, w // 100), 0.5), (max(8, w // 36), 0.42 + 0.35 * end)):
            small = hi_im.resize((w // 2, h // 2), Image.BILINEAR).filter(ImageFilter.GaussianBlur(r / 2))
            glow += np.asarray(small.resize((w, h), Image.BILINEAR)).astype(np.float32) / 255.0 * wgt
        # anamorphic streaks from the hottest points only
        hot = (np.clip((luma - 0.82) / 0.18, 0, 1) ** 2)[..., None] * disp
        sh, sw = h // 8, w // 8
        hot_s = np.asarray(Image.fromarray((hot * 255).astype(np.uint8)).resize((sw, sh), Image.BILINEAR)).astype(np.float32) / 255.0
        streak = hblur(hot_s, max(3, sw // 10))
        streak = np.asarray(Image.fromarray((np.clip(streak * 3.0, 0, 1) * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float32) / 255.0
        streak *= np.array([1.0, 0.55, 0.45], np.float32) * 0.5  # warm-tinted
        out = 1 - (1 - disp) * (1 - np.clip(glow + streak, 0, 1))
        # chromatic aberration: red pushed out, blue pulled in, towards the edges
        res = Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8))
        r_, g_, b_ = res.split()
        k = 0.0016
        r_ = r_.transform((w, h), Image.AFFINE, (1 - k, 0, w * k / 2, 0, 1 - k, h * k / 2), Image.BILINEAR)
        b_ = b_.transform((w, h), Image.AFFINE, (1 + k, 0, -w * k / 2, 0, 1 + k, -h * k / 2), Image.BILINEAR)
        out = np.asarray(Image.merge("RGB", (r_, g_, b_))).astype(np.float32) / 255.0
        # v3 grade: everything that isn't a light goes dull. Desaturate by darkness (the
        # dim, coloured spill on concrete greys out; lamps, signs and their halos keep
        # their colour), cool the shadows, then lift the blacks into grey-teal smog.
        luma2 = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        dull = 0.62 * (1 - np.clip((luma2 - 0.10) / 0.45, 0, 1))
        cool = np.clip((out[..., 2] - out[..., 0]) / np.maximum(luma2, 0.02) * 2.0, 0, 1)
        dull = (dull * (1 - 0.75 * end * cool))[..., None]
        out = out + (luma2[..., None] - out) * dull
        shadow = (np.clip(1 - luma2 / 0.38, 0, 1) ** 1.4)[..., None]
        out = out * (1 - shadow * np.array([0.14, 0.03, -0.06], np.float32))
        lift = (1 - np.clip(luma2 / 0.25, 0, 1))[..., None] * np.array([0.020, 0.027, 0.031], np.float32)
        out = out + lift * (1 - out)
        # vignette + quiet bands for the overlaid copy, easing in over the last quarter
        yy, xx = np.mgrid[0:h, 0:w]
        d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
        vig = 1 - 0.32 * np.clip(d - 0.5, 0, 1) ** 1.3
        kq = np.clip((t - 0.72) / 0.28, 0, 1)
        kq = kq * kq * (3 - 2 * kq)
        vv = yy / h
        band = np.maximum(np.clip(1 - vv / 0.22, 0, 1), np.clip((vv - 0.73) / 0.27, 0, 1))
        vig = vig * (1 - 0.6 * kq * band ** 1.5)
        out = out * vig[..., None]
        if getattr(args, "format", "png") == "webp":
            # fine luminance grain for stills, deterministic per frame
            rng = np.random.default_rng(frame)
            g = rng.normal(0, 0.008, (h, w)).astype(np.float32)
            out = np.clip(out + g[..., None] * (0.35 + out.mean(axis=2, keepdims=True)), 0, 1)
        res = Image.fromarray((np.clip(out, 0, 1) * 255 + 0.5).astype(np.uint8))
        if getattr(args, "format", "png") == "webp":
            res.save(os.path.join(args.dst, name.replace(".png", ".webp")), "WEBP", quality=args.quality, method=6)
        else:
            res.save(os.path.join(args.dst, name), "PNG", compress_level=1)
        if args.poster and frame == 1:
            res.save(args.poster, "JPEG", quality=80, optimize=True, progressive=True)
    print(f"post: {len(files)} frames -> {args.dst}")


# --------------------------------------------------------------------------
# Encode: frames -> a video the page scrubs with scroll. A keyframe every few
# frames keeps seeking cheap in both directions; faststart puts the index up
# front. .mp4 = H.264 High (hardware decode everywhere), .webm = VP9 (for
# browsers without H.264, e.g. open-source Chromium builds).
# --------------------------------------------------------------------------
def encode(args):
    import subprocess

    src = os.path.join(args.src, "%04d.png")
    common = ["-y", "-loglevel", "error", "-framerate", str(args.fps), "-i", src, "-an", "-pix_fmt", "yuv420p",
              "-g", str(args.gop), "-keyint_min", str(args.gop)]
    if args.dst.endswith(".webm"):
        cmd = ["ffmpeg", *common, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", str(args.crf),
               "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", args.dst]
    else:
        cmd = ["ffmpeg", *common, "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", str(args.crf),
               "-sc_threshold", "0", "-movflags", "+faststart", args.dst]
    t0 = time.time()
    subprocess.run(cmd, check=True)
    print(f"encode: {args.dst} {os.path.getsize(args.dst) / 1e6:.2f} MB in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    a = args_from_cli()
    {"render": render, "still": still, "post": post, "look": look, "encode": encode}[a.mode](a)
