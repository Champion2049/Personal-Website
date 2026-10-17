"""
Night City flythrough: a procedural, rain-soaked neon avenue rendered as an
image sequence for the scroll-scrubbed intro on /about-me.

Everything is generated from code (no external assets apart from the OFL
fonts next to this file), so the look can be tweaked and re-rendered:

    # render frames (PNG) into a folder
    python night_city_flythrough.py render --res desktop --frames 120 --out /tmp/nc/d
    python night_city_flythrough.py render --res mobile  --frames 90  --out /tmp/nc/m

    # bloom + vignette + encode to WebP for the site
    python night_city_flythrough.py post --src /tmp/nc/d --dst client/public/nightcity/fly/d --quality 70

    # a single still (any frame) for look-dev
    python night_city_flythrough.py still --res desktop --frames 120 --frame 60 --out /tmp/nc/still.png

`python` is any interpreter with the `bpy` module (pip install bpy), or run
inside Blender: blender -b -P night_city_flythrough.py -- render ...
Saving --blend path.blend writes the generated scene so it can be opened in
Blender's UI.

Scene layout (Blender units ~ metres): the avenue runs along +Y, the road is
the strip |x| < 7 at z = 0, towers line both sides from y = -20 to y = 300
and a mega-tower closes the street at y ~ 340 with the NIGHT CITY sign.
"""

import argparse
import math
import os
import random
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(HERE, "fonts")


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


RED = srgb("#ff3a2e")        # primary neon red
RED_DEEP = srgb("#c2140c")   # darker red for big boards
YELLOW = srgb("#f3e600")     # --nc-yellow
AMBER = srgb("#ffb347")      # warm window light
CYAN = srgb("#00f0ff")       # --nc-cyan (rare accent)
WHITE_WARM = srgb("#ffe9c9")
# Emission versions of the neon colours. #ff3a2e has enough blue that a bright
# emitter clips to salmon/pink once red saturates; these keep blue << green so
# hot cores go red-orange instead.
NEON_RED = (1.0, 0.03, 0.006, 1.0)
NEON_YELLOW = (0.95, 0.72, 0.0, 1.0)
FOG = srgb("#3a0d0c")        # red smog, hsl(2 65% 14%)
BG = srgb("#0f0606")         # hsl(0 45% 4%)

SIGN_WORDS = [
    # (text, colour, vertical?)  — words from lib/personal-data.ts
    ("SYNTHWAVE", RED, True),
    ("GUITAR", YELLOW, True),
    ("PHONK", RED, False),
    ("ARCADE", YELLOW, False),
    ("SOULS", RED, True),
    ("ANIME", YELLOW, True),
    ("RADIO", RED, False),
    ("SCI-FI", RED, False),
    ("ROVER", YELLOW, True),
    ("OST", CYAN, False),
    ("NOODLES", YELLOW, True),
    ("CHIDS", RED, True),
    ("NEON", YELLOW, False),
    ("RAIN", RED, True),
    ("EDGERUNNER", YELLOW, True),
    ("SEKIRO", RED, False),
]


def args_from_cli():
    argv = sys.argv
    argv = argv[argv.index("--") + 1:] if "--" in argv else argv[1:]
    p = argparse.ArgumentParser()
    p.add_argument("mode", choices=["render", "still", "post"])
    p.add_argument("--res", choices=["desktop", "mobile"], default="desktop")
    p.add_argument("--frames", type=int, default=120)
    p.add_argument("--frame", type=int, default=1)
    p.add_argument("--start", type=int, default=1)
    p.add_argument("--end", type=int, default=0)
    p.add_argument("--out", default="/tmp/nc")
    p.add_argument("--samples", type=int, default=20)
    p.add_argument("--scale", type=int, default=100, help="resolution percentage")
    p.add_argument("--blend", default="")
    p.add_argument("--src", default="")
    p.add_argument("--dst", default="")
    p.add_argument("--quality", type=int, default=70)
    p.add_argument("--poster", default="")
    p.add_argument("--size", default="", help="WxH to resize to before post (e.g. 1280x720)")
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
    me.update()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    ob.rotation_euler = rot
    return link(ob, coll)


# --------------------------------------------------------------------------
# Materials. Every surface gets the same cheap "smog": a mix toward a red
# emission by camera distance (denser near the ground). Far cheaper than
# volumetrics and it also fogs what the wet road reflects.
# --------------------------------------------------------------------------
def add_fog(nt, surface_socket, density=0.0085, strength=0.55):
    n, l = nt.nodes, nt.links
    cam = n.new("ShaderNodeCameraData")
    geo = n.new("ShaderNodeNewGeometry")
    sep = n.new("ShaderNodeSeparateXYZ")
    l.new(geo.outputs["Position"], sep.inputs[0])
    # height term: 1 + 1.6 * exp(-z / 22)
    hz = n.new("ShaderNodeMath"); hz.operation = "MULTIPLY"; hz.inputs[1].default_value = -1 / 22
    l.new(sep.outputs["Z"], hz.inputs[0])
    he = n.new("ShaderNodeMath"); he.operation = "EXPONENT"
    l.new(hz.outputs[0], he.inputs[0])
    hm = n.new("ShaderNodeMath"); hm.operation = "MULTIPLY_ADD"
    hm.inputs[1].default_value = 1.6; hm.inputs[2].default_value = 1.0
    l.new(he.outputs[0], hm.inputs[0])
    # optical depth = distance * density * height term
    d1 = n.new("ShaderNodeMath"); d1.operation = "MULTIPLY"; d1.inputs[1].default_value = -density
    l.new(cam.outputs["View Distance"], d1.inputs[0])
    d2 = n.new("ShaderNodeMath"); d2.operation = "MULTIPLY"
    l.new(d1.outputs[0], d2.inputs[0]); l.new(hm.outputs[0], d2.inputs[1])
    ex = n.new("ShaderNodeMath"); ex.operation = "EXPONENT"
    l.new(d2.outputs[0], ex.inputs[0])
    fac = n.new("ShaderNodeMath"); fac.operation = "SUBTRACT"; fac.inputs[0].default_value = 1.0
    l.new(ex.outputs[0], fac.inputs[1])
    clampf = n.new("ShaderNodeMath"); clampf.operation = "MINIMUM"; clampf.inputs[1].default_value = 0.86
    l.new(fac.outputs[0], clampf.inputs[0])
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = FOG
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
    # Emissive signs/windows are seen and reflected, but don't act as lights
    # (keeps noise and render time down; real lamps handle the lighting).
    for attr in ("emission_sampling",):
        if hasattr(m, attr):
            setattr(m, attr, "NONE")
    if hasattr(m, "cycles") and hasattr(m.cycles, "emission_sampling"):
        m.cycles.emission_sampling = "NONE"


def mat_emit(name, color, strength, fog=True, fog_strength=1.0):
    m, nt, out = new_mat(name)
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = color
    em.inputs["Strength"].default_value = strength
    sock = em.outputs[0]
    if fog:
        sock = add_fog(nt, sock, density=0.0075, strength=fog_strength)
    nt.links.new(sock, out.inputs["Surface"])
    no_light_sampling(m)
    return m


def mat_dark(name, color=(0.012, 0.009, 0.009, 1), rough=0.55, metal=0.2):
    m, nt, out = new_mat(name)
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    nt.links.new(add_fog(nt, b.outputs[0]), out.inputs["Surface"])
    return m


def mat_tower(name="tower", dens_lo=0.05, dens_span=0.26, bright=1.25):
    """Dark facade with a procedural, per-building grid of lit windows."""
    m, nt, out = new_mat(name)
    n, l = nt.nodes, nt.links
    geo = n.new("ShaderNodeNewGeometry")
    info = n.new("ShaderNodeObjectInfo")
    pos = n.new("ShaderNodeSeparateXYZ"); l.new(geo.outputs["Position"], pos.inputs[0])
    nrm = n.new("ShaderNodeSeparateXYZ"); l.new(geo.outputs["Normal"], nrm.inputs[0])

    def math(op, a=None, b=None, va=None, vb=None):
        nd = n.new("ShaderNodeMath"); nd.operation = op
        if a is not None: l.new(a, nd.inputs[0])
        elif va is not None: nd.inputs[0].default_value = va
        if b is not None: l.new(b, nd.inputs[1])
        elif vb is not None: nd.inputs[1].default_value = vb
        return nd.outputs[0]

    # horizontal facade coordinate: y on x-facing walls, x on y-facing walls
    ax = math("ABSOLUTE", nrm.outputs["X"])
    ay = math("ABSOLUTE", nrm.outputs["Y"])
    az = math("ABSOLUTE", nrm.outputs["Z"])
    u = math("ADD", math("MULTIPLY", pos.outputs["Y"], ax), math("MULTIPLY", pos.outputs["X"], ay))
    u = math("ADD", u, math("MULTIPLY", info.outputs["Random"], vb=97.0))
    # window pitch: ~1.6 m wide, 3.1 m storeys
    gu = math("MULTIPLY", u, vb=1 / 1.6)
    gv = math("MULTIPLY", pos.outputs["Z"], vb=1 / 3.1)
    fu = math("FRACT", gu); fv = math("FRACT", gv)
    cu = math("FLOOR", gu); cv = math("FLOOR", gv)
    # window aperture
    inu = math("MULTIPLY", math("GREATER_THAN", fu, vb=0.28), math("LESS_THAN", fu, vb=0.72))
    inv = math("MULTIPLY", math("GREATER_THAN", fv, vb=0.34), math("LESS_THAN", fv, vb=0.72))
    aperture = math("MULTIPLY", inu, inv)
    # no windows on roofs or the first storey (shopfronts are separate)
    wall = math("LESS_THAN", az, vb=0.5)
    above = math("GREATER_THAN", pos.outputs["Z"], vb=5.5)
    aperture = math("MULTIPLY", math("MULTIPLY", aperture, wall), above)
    # per-window random: lit or dark, and which colour
    comb = n.new("ShaderNodeCombineXYZ")
    l.new(cu, comb.inputs[0]); l.new(cv, comb.inputs[1]); l.new(info.outputs["Random"], comb.inputs[2])
    wn = n.new("ShaderNodeTexWhiteNoise"); wn.noise_dimensions = "3D"
    l.new(comb.outputs[0], wn.inputs["Vector"])
    # share of lit windows varies per building (dens_lo .. dens_lo + dens_span)
    dens = math("MULTIPLY_ADD", info.outputs["Random"], vb=dens_span, b=None)
    nd_dens = dens.node; nd_dens.inputs[2].default_value = dens_lo
    lit = math("LESS_THAN", wn.outputs["Value"], dens)
    win = math("MULTIPLY", aperture, lit)
    # colour ramp over the second random channel: amber / warm white / red / rare cyan
    sepc = n.new("ShaderNodeSeparateColor"); l.new(wn.outputs["Color"], sepc.inputs[0])
    ramp = n.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position = 0.0; cr.elements[0].color = AMBER
    cr.elements[1].position = 0.45; cr.elements[1].color = WHITE_WARM
    e = cr.elements.new(0.7); e.color = NEON_RED
    e = cr.elements.new(0.965); e.color = CYAN
    l.new(sepc.outputs[0], ramp.inputs["Fac"])
    # brightness jitter per window
    bj = math("MULTIPLY_ADD", sepc.outputs[2], vb=1.4)
    bj.node.inputs[2].default_value = 0.35
    strength = math("MULTIPLY", win, bj)
    # inside the window: blind slats and a top-to-bottom falloff
    slat = math("MULTIPLY_ADD", math("GREATER_THAN", math("FRACT", math("MULTIPLY", fv, vb=22.0)), vb=0.45), vb=0.55)
    slat.node.inputs[2].default_value = 0.45
    fall = math("MULTIPLY_ADD", fv, vb=-1.1, b=None); fall.node.inputs[2].default_value = 1.25
    strength = math("MULTIPLY", math("MULTIPLY", strength, slat), fall)
    strength = math("MULTIPLY", strength, vb=bright)
    em = n.new("ShaderNodeEmission")
    l.new(ramp.outputs["Color"], em.inputs["Color"])
    l.new(strength, em.inputs["Strength"])
    # facade: near-black wet concrete/glass
    b = n.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (0.010, 0.008, 0.008, 1)
    b.inputs["Roughness"].default_value = 0.42
    b.inputs["Metallic"].default_value = 0.35
    add = n.new("ShaderNodeAddShader")
    l.new(b.outputs[0], add.inputs[0]); l.new(em.outputs[0], add.inputs[1])
    l.new(add_fog(nt, add.outputs[0]), out.inputs["Surface"])
    no_light_sampling(m)
    return m


def mat_road():
    """Wet asphalt: glossy with noisy puddles, faint lane paint."""
    m, nt, out = new_mat("road")
    n, l = nt.nodes, nt.links
    tc = n.new("ShaderNodeTexCoord")
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 0.11
    noise.inputs["Detail"].default_value = 6
    l.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = n.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.42
    ramp.inputs["From Max"].default_value = 0.6
    ramp.inputs["To Min"].default_value = 0.34
    ramp.inputs["To Max"].default_value = 0.03
    l.new(noise.outputs["Fac"], ramp.inputs["Value"])
    bump_n = n.new("ShaderNodeTexNoise"); bump_n.inputs["Scale"].default_value = 3.5
    l.new(tc.outputs["Object"], bump_n.inputs["Vector"])
    bump = n.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.05
    l.new(bump_n.outputs["Fac"], bump.inputs["Height"])
    b = n.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (0.006, 0.005, 0.005, 1)
    b.inputs["Metallic"].default_value = 0.0
    if "Specular IOR Level" in b.inputs:
        b.inputs["Specular IOR Level"].default_value = 0.7
    l.new(ramp.outputs[0], b.inputs["Roughness"])
    l.new(bump.outputs["Normal"], b.inputs["Normal"])
    l.new(add_fog(nt, b.outputs[0]), out.inputs["Surface"])
    return m


def mat_shopfront(name, color, strength=1.1):
    """Lit shop window: mullioned glass, brighter towards the top, uneven inside."""
    m, nt, out = new_mat(name)
    n, l = nt.nodes, nt.links
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["UV"], sep.inputs[0])

    def math(op, a=None, va=None, vb=None, b=None):
        nd = n.new("ShaderNodeMath"); nd.operation = op
        if a is not None: l.new(a, nd.inputs[0])
        elif va is not None: nd.inputs[0].default_value = va
        if b is not None: l.new(b, nd.inputs[1])
        elif vb is not None: nd.inputs[1].default_value = vb
        return nd.outputs[0]

    mull = math("GREATER_THAN", math("FRACT", math("MULTIPLY", sep.outputs["X"], vb=11.0)), vb=0.06)
    rail = math("GREATER_THAN", math("ABSOLUTE", math("SUBTRACT", sep.outputs["Y"], vb=0.72)), vb=0.025)
    grad = math("MULTIPLY_ADD", sep.outputs["Y"], vb=1.1, b=None); grad.node.inputs[2].default_value = 0.15
    noise = n.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 4.0
    l.new(tc.outputs["UV"], noise.inputs["Vector"])
    k = math("MULTIPLY", math("MULTIPLY", mull, rail), grad)
    k = math("MULTIPLY", k, noise.outputs["Fac"])
    k = math("MULTIPLY", k, vb=strength * 2.0)
    em = n.new("ShaderNodeEmission"); em.inputs["Color"].default_value = color
    l.new(k, em.inputs["Strength"])
    b = n.new("ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (0.01, 0.008, 0.008, 1)
    b.inputs["Roughness"].default_value = 0.08
    add = n.new("ShaderNodeAddShader")
    l.new(b.outputs[0], add.inputs[0]); l.new(em.outputs[0], add.inputs[1])
    l.new(add_fog(nt, add.outputs[0]), out.inputs["Surface"])
    no_light_sampling(m)
    return m


def mat_rain():
    m, nt, out = new_mat("rain")
    n, l = nt.nodes, nt.links
    em = n.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = srgb("#ffd9cf")
    em.inputs["Strength"].default_value = 0.35
    tr = n.new("ShaderNodeBsdfTransparent")
    mix = n.new("ShaderNodeMixShader"); mix.inputs[0].default_value = 0.3
    l.new(tr.outputs[0], mix.inputs[1]); l.new(em.outputs[0], mix.inputs[2])
    l.new(mix.outputs[0], out.inputs["Surface"])
    no_light_sampling(m)
    return m


def mat_world(scene):
    w = bpy.data.worlds.new("night")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    n, l = nt.nodes, nt.links
    bg = nt.nodes.get("Background") or n.new("ShaderNodeBackground")
    out = nt.nodes.get("World Output") or n.new("ShaderNodeOutputWorld")
    tc = n.new("ShaderNodeTexCoord")
    sep = n.new("ShaderNodeSeparateXYZ"); l.new(tc.outputs["Generated"], sep.inputs[0])
    mr = n.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -0.05
    mr.inputs["From Max"].default_value = 0.45
    l.new(sep.outputs["Z"], mr.inputs["Value"])
    mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"
    mix.inputs[6].default_value = (0.11, 0.022, 0.02, 1)   # horizon: light-polluted smog
    mix.inputs[7].default_value = (0.004, 0.0016, 0.0016, 1)  # zenith
    l.new(mr.outputs[0], mix.inputs[0])
    l.new(mix.outputs[2], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = 1.0
    l.new(bg.outputs[0], out.inputs["Surface"])


# --------------------------------------------------------------------------
# Neon text. Outline signs use the glyph curves with fill off + bevel, so they
# read as bent glass tubes; box signs are filled letters on a dark board.
# --------------------------------------------------------------------------
_FONTS = {}


def font(name):
    if name not in _FONTS:
        _FONTS[name] = bpy.data.fonts.load(os.path.join(FONT_DIR, name))
    return _FONTS[name]


def neon_text(name, text, size, mat, loc, rot, tube=False, fontfile="BarlowCondensed-ExtraBold.ttf",
              vertical=False, coll=None, spacing=1.0):
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
        cu.bevel_depth = size * 0.022
        cu.bevel_resolution = 1
        cu.resolution_u = 6
    else:
        cu.extrude = size * 0.03
        cu.resolution_u = 4
    cu.materials.append(mat)
    ob = bpy.data.objects.new(name, cu)
    ob.location = loc
    ob.rotation_euler = rot
    return link(ob, coll)


# --------------------------------------------------------------------------
# The city
# --------------------------------------------------------------------------
ROAD_HALF = 7.0
WALK = 4.0
ST_EDGE = ROAD_HALF + WALK  # building line
END_Y = 340.0


def spill_color(col):
    if col is YELLOW:
        return (1.0, 0.5, 0.08)
    if col is CYAN:
        return (0.2, 0.75, 1.0)
    return (1.0, 0.08, 0.03)


def build_city(scene, rnd):
    city = bpy.data.collections.new("city"); scene.collection.children.link(city)
    signs = bpy.data.collections.new("signs"); scene.collection.children.link(signs)

    tower = mat_tower()
    dark = mat_dark("facade_dark")
    board = mat_dark("sign_board", color=(0.008, 0.004, 0.004, 1), rough=0.35, metal=0.5)
    road = mat_road()
    curb = mat_dark("curb", color=(0.02, 0.016, 0.016, 1), rough=0.3, metal=0.0)
    emit = {
        "red": mat_emit("neon_red", NEON_RED, 5.0),
        "red_dim": mat_emit("neon_red_dim", NEON_RED, 2.0),
        "red_deep": mat_emit("neon_red_deep", RED_DEEP, 2.2),
        "yellow": mat_emit("neon_yellow", NEON_YELLOW, 4.0),
        "yellow_dim": mat_emit("neon_yellow_dim", NEON_YELLOW, 1.5),
        "cyan": mat_emit("neon_cyan", CYAN, 5.0),
        "warm": mat_emit("lamp_warm", WHITE_WARM, 7.0),
        "tail": mat_emit("tail_light", NEON_RED, 9.0),
        "head": mat_emit("head_light", WHITE_WARM, 10.0),
        "giant": mat_emit("giant_sign", NEON_RED, 6.0, fog_strength=0.25),
    }
    color_mat = {id(RED): "red", id(YELLOW): "yellow", id(CYAN): "cyan"}
    shops = [mat_shopfront("shop_red", NEON_RED, 0.55), mat_shopfront("shop_red2", RED_DEEP, 0.7),
             mat_shopfront("shop_amber", AMBER, 0.32), mat_shopfront("shop_dark", NEON_RED, 0.22)]
    mega_mat = mat_tower("tower_mega", dens_lo=0.03, dens_span=0.05, bright=0.8)

    # ground: road, sidewalks, curbs
    plane("road", (0, END_Y / 2, 0), (2 * ROAD_HALF, END_Y + 80), (0, 0, 0), road, city)
    for s in (-1, 1):
        box(f"walk{s}", (s * (ROAD_HALF + WALK / 2), END_Y / 2, 0), (WALK, END_Y + 80, 0.16), curb, city)
    # lane dashes (dim, so they read only in reflections of light)
    lane = mat_emit("lane", WHITE_WARM, 0.35)
    for i in range(0, int(END_Y), 9):
        box(f"dash{i}", (0, i, 0.005), (0.16, 3.2, 0.01), lane, city)

    # towers, both sides, with setbacks
    sign_i = 0
    for side in (-1, 1):
        y = -24.0
        while y < END_Y - 30:
            w = rnd.uniform(9, 20)          # frontage along the street
            d = rnd.uniform(14, 28)          # depth away from the street
            h = rnd.choice([rnd.uniform(26, 60), rnd.uniform(55, 120), rnd.uniform(90, 170)])
            if y > 175:
                h = rnd.uniform(18, 58)
            gap = rnd.uniform(0.8, 3.5)
            cx = side * (ST_EDGE + d / 2 + rnd.uniform(0, 1.5))
            cy = y + w / 2
            box(f"t{side}_{int(y)}", (cx, cy, 0), (d, w, h), tower, city)
            # setback crown
            if h > 50 and y < 175 and rnd.random() < 0.7:
                h2 = rnd.uniform(10, 40)
                box(f"tc{side}_{int(y)}", (cx + side * rnd.uniform(1, 4), cy, h), (d * 0.7, w * 0.7, h2), tower, city)
                if rnd.random() < 0.5:  # rooftop beacon
                    box(f"bc{side}_{int(y)}", (cx, cy, h + h2), (0.5, 0.5, 6), emit["red"], city)
            # vertical corner strip on the street-facing edge
            if rnd.random() < 0.4 and y < 165:
                strip = emit[rnd.choice(["red_dim", "red_dim", "yellow_dim"])]
                for e in (-1, 1):
                    box(f"st{side}_{int(y)}_{e}", (side * (ST_EDGE + 0.15), cy + e * (w / 2 - 0.2), 6),
                        (0.12, 0.12, h - 8), strip, city)
            # shopfront band: dark canopy + glowing strip
            box(f"cn{side}_{int(y)}", (side * (ST_EDGE - 1.2), cy, 4.2), (2.6, w - 1, 0.25), dark, city)
            box(f"cl{side}_{int(y)}", (side * (ST_EDGE - 2.45), cy, 4.15), (0.08, w - 1.2, 0.08),
                emit[rnd.choice(["red", "yellow_dim", "red_dim", "warm"])], city)
            plane(f"sf{side}_{int(y)}", (side * (ST_EDGE - 0.02), cy, 1.75), (w - 1.5, 2.9),
                  (math.pi / 2, 0, math.pi / 2), rnd.choice(shops), city)

            # neon sign on this building?
            if sign_i < len(SIGN_WORDS) and rnd.random() < 0.8 and y > 4:
                word, col, vertical = SIGN_WORDS[sign_i]
                sign_i += 1
                mname = color_mat[id(col)]
                tube = rnd.random() < 0.45
                if vertical:
                    # blade sign projecting from the facade, readable from down the street
                    size = rnd.uniform(1.5, 2.1)
                    zc = rnd.uniform(11, 20)
                    hgt = len(word) * size * 0.86 + 1.4
                    px = side * (ST_EDGE - 1.3)
                    box(f"bb_{word}", (px, cy, zc - hgt / 2), (1.9, 0.35, hgt), board, signs)
                    # frame lines
                    for e in (-1, 1):
                        box(f"bf_{word}{e}", (px + e * 0.97, cy - 0.2, zc - hgt / 2), (0.06, 0.06, hgt), emit[mname], signs)
                    rot = (math.pi / 2, 0, 0)  # text faces -Y, towards the camera
                    neon_text(f"sg_{word}", word, size, emit[mname], (px, cy - 0.22, zc), rot,
                              tube=tube, vertical=True, coll=signs)
                    # spill light so the sign actually lights its surroundings
                    lamp = bpy.data.lights.new(f"spill_{word}", "POINT")
                    lamp.color = spill_color(col); lamp.energy = 1300; lamp.shadow_soft_size = 1.2
                    lo = bpy.data.objects.new(f"spill_{word}", lamp)
                    lo.location = (px - side * 1.6, cy - 2.0, zc - 2)
                    link(lo, signs)
                else:
                    # flat sign on the facade above the canopy, slanted towards the street
                    size = rnd.uniform(1.6, 2.3)
                    zc = rnd.uniform(7.5, 11)
                    width = len(word) * size * 0.55 + 1.6
                    px = side * (ST_EDGE - 2.6)
                    rz = (math.pi / 2 - 0.75) if side < 0 else -(math.pi / 2 - 0.75)
                    # bracket back to the wall
                    box(f"br_{word}", (side * (ST_EDGE - 1.3), cy, zc + size * 0.75), (2.6, 0.12, 0.12), board, signs)
                    neon_text(f"sg_{word}", word, size, emit[mname], (px, cy, zc), (math.pi / 2, 0, rz),
                              tube=tube, coll=signs)
                    nb = Vector((math.sin(rz), -math.cos(rz), 0))  # sign normal (towards camera)
                    plane(f"sb_{word}", tuple(Vector((px, cy, zc)) - nb * 0.06), (width, size * 1.35),
                          (math.pi / 2, 0, rz), board, signs)
                    lamp = bpy.data.lights.new(f"spill_{word}", "AREA")
                    lamp.color = spill_color(col); lamp.energy = 650; lamp.size = width
                    lo = bpy.data.objects.new(f"spill_{word}", lamp)
                    lo.location = (px - side * 2.5, cy, zc - 1)
                    lo.rotation_euler = (0, -side * math.pi / 2.4, 0)
                    link(lo, signs)
            y += w + gap

    # holo billboards high on a few towers. (A fourth, at y=240 on the right,
    # read as a blank red slab right in front of the camera during the rise.)
    for i, (side, yy, zz, colname) in enumerate([(-1, 70, 34, "red_deep"), (1, 128, 46, "yellow_dim"),
                                                  (-1, 190, 58, "red_deep")]):
        px = side * (ST_EDGE + 0.4)
        rz = math.pi / 2 if side < 0 else -math.pi / 2
        plane(f"bill{i}", (px, yy, zz), (16, 9), (math.pi / 2, 0, rz), emit[colname], signs)
        box(f"billf{i}", (px, yy, zz - 4.6), (0.3, 16.4, 0.18), emit["red" if colname != "yellow_dim" else "yellow"], signs)

    # cables strung across the street (sagging bezier curves)
    cable_mat = mat_dark("cable", color=(0.004, 0.003, 0.003, 1), rough=0.6, metal=0.0)
    for i in range(16):
        yy = rnd.uniform(6, END_Y - 50)
        z0 = rnd.uniform(9, 22)
        cu = bpy.data.curves.new(f"cable{i}", "CURVE"); cu.dimensions = "3D"
        cu.bevel_depth = 0.035
        sp = cu.splines.new("BEZIER"); sp.bezier_points.add(2)
        pts = [(-ST_EDGE, yy, z0), (0, yy + rnd.uniform(-1, 1), z0 - rnd.uniform(1.5, 4)),
               (ST_EDGE, yy + rnd.uniform(-2, 2), z0 + rnd.uniform(-2, 2))]
        for bp, p in zip(sp.bezier_points, pts):
            bp.co = p; bp.handle_left_type = bp.handle_right_type = "AUTO"
        cu.materials.append(cable_mat)
        link(bpy.data.objects.new(f"cable{i}", cu), city)
        # a few strings of little lanterns hanging off the cables
        if rnd.random() < 0.35:
            for k in range(7):
                t = (k + 1) / 8
                x = -ST_EDGE + t * 2 * ST_EDGE
                sag = (1 - (2 * t - 1) ** 2) * 2.4
                box(f"lan{i}_{k}", (x, yy, z0 - sag - 0.6), (0.35, 0.35, 0.45), emit[rnd.choice(["red", "yellow"])], signs)

    # street lamps
    pole = mat_dark("pole", color=(0.01, 0.01, 0.01, 1), rough=0.4, metal=0.8)
    for side in (-1, 1):
        for yy in range(10, int(END_Y - 40), 26):
            yy += side * 6
            px = side * (ROAD_HALF + 0.6)
            box(f"pole{side}{yy}", (px, yy, 0), (0.18, 0.18, 8.2), pole, city)
            box(f"arm{side}{yy}", (px - side * 1.2, yy, 8.0), (2.4, 0.15, 0.15), pole, city)
            box(f"lamp{side}{yy}", (px - side * 2.1, yy, 7.85), (0.9, 0.35, 0.12), emit["warm"], city)
            lt = bpy.data.lights.new(f"sl{side}{yy}", "SPOT")
            lt.color = (1.0, 0.62, 0.42); lt.energy = 2600; lt.spot_size = math.radians(110); lt.shadow_soft_size = 0.4
            lo = bpy.data.objects.new(f"sl{side}{yy}", lt)
            lo.location = (px - side * 2.1, yy, 7.6)
            link(lo, city)

    # parked/moving traffic: tail lights (red) and head lights, staggered down the road
    for i in range(26):
        yy = rnd.uniform(18, END_Y - 20)
        lane_x = rnd.choice([-4.8, -4.4, 4.4, 4.8])
        away = lane_x > 0  # right lanes drive away from us: we see tail lights
        body_mat = dark
        box(f"car{i}", (lane_x, yy, 0.3), (1.9, 4.4, 0.75), body_mat, city)
        box(f"cab{i}", (lane_x, yy + 0.3, 1.05), (1.6, 2.2, 0.55), body_mat, city)
        lm = emit["tail"] if away else emit["head"]
        for e in (-1, 1):
            box(f"cl{i}{e}", (lane_x + e * 0.7, yy - 2.21, 0.8), (0.42, 0.04, 0.12), lm, city)

    # mega-tower closing the avenue, with the giant sign
    box("mega", (0, END_Y + 30, 0), (70, 40, 230), mega_mat, city)
    box("mega_crown", (0, END_Y + 30, 230), (40, 26, 40), mega_mat, city)
    box("mega_spire", (0, END_Y + 30, 270), (2, 2, 46), emit["red"], city)
    gz = 128.0
    box("giant_board", (0, END_Y + 9.6, gz - 13), (60, 0.6, 26), board, signs)
    neon_text("giant_night", "NIGHT CITY", 13.0, emit["giant"], (0, END_Y + 9.0, gz + 2.5), (math.pi / 2, 0, 0),
              fontfile="BarlowCondensed-ExtraBold.ttf", coll=signs, spacing=1.08)
    neon_text("giant_handle", "WELCOME, CHOOM", 3.3, emit["yellow"], (0, END_Y + 9.0, gz - 8.5), (math.pi / 2, 0, 0),
              fontfile="Rajdhani-Bold.ttf", coll=signs, spacing=1.6)
    for e in (-1, 1):
        box(f"giant_rule{e}", (e * 17, END_Y + 9.0, gz - 8.4), (14, 0.2, 0.22), emit["red"], signs)
        # yellow frame posts either side of the board, and red edge ribs up the tower
        box(f"giant_post{e}", (e * 30.2, END_Y + 9.2, gz - 13), (0.35, 0.3, 26), emit["yellow_dim"], signs)
        for k in range(3):
            box(f"mega_rib{e}{k}", (e * (34.6 - k * 1.2), END_Y + 9.9, 0), (0.25, 0.25, 230 - k * 30), emit["red_dim"], signs)
    # the board spans gz-13 .. gz+13 (boxes grow up from their origin)
    box("giant_top", (0, END_Y + 9.2, gz + 13), (60.6, 0.3, 0.35), emit["yellow_dim"], signs)
    box("giant_bot", (0, END_Y + 9.2, gz - 13.35), (60.6, 0.3, 0.35), emit["yellow_dim"], signs)
    for k in range(7):  # dark spandrel bands across the facade
        box(f"mega_band{k}", (0, END_Y + 9.85, 20 + k * 30), (70.2, 0.3, 1.4), board, city)
    # a few aerial vehicles: just their running lights, far out over the city
    for i in range(7):
        yy = rnd.uniform(300, END_Y + 60); xx = rnd.choice([-1, 1]) * rnd.uniform(40, 110); zz = rnd.uniform(90, 170)
        box(f"av{i}", (xx, yy, zz), (0.9, 2.2, 0.5), emit["warm"], signs)
        box(f"avr{i}", (xx, yy - 1.3, zz), (0.9, 0.1, 0.3), emit["tail"], signs)
    lt = bpy.data.lights.new("giant_spill", "AREA"); lt.color = (1, 0.12, 0.05); lt.energy = 16000; lt.size = 40
    lo = bpy.data.objects.new("giant_spill", lt); lo.location = (0, END_Y - 8, gz - 5); lo.rotation_euler = (math.radians(70), 0, 0)
    link(lo, signs)
    # flanking skyline behind, so the end of the street isn't a wall
    for i in range(14):
        x = rnd.uniform(-260, 260)
        if abs(x) < 45:
            continue
        box(f"far{i}", (x, END_Y + rnd.uniform(40, 160), 0), (rnd.uniform(20, 45), rnd.uniform(20, 45), rnd.uniform(80, 220)), tower, city)


def build_rain(scene, cam, rnd, n=360):
    """Thin streaks parented to the camera; the sheet falls a bit each frame."""
    rain = bpy.data.collections.new("rain"); scene.collection.children.link(rain)
    mat = mat_rain()
    me = bpy.data.meshes.new("rain_mesh")
    verts, faces = [], []
    for i in range(n):
        # camera space: x right, y up, -z forward
        x = rnd.uniform(-9, 9)
        y = rnd.uniform(-6, 12)
        z = -rnd.uniform(4.0, 26)
        ln = rnd.uniform(0.35, 0.8)
        wdt = 0.004 + 0.0005 * -z
        sl = 0.10  # slant
        b = len(verts)
        verts += [(x - wdt, y, z), (x + wdt, y, z), (x + wdt + sl * ln, y + ln, z), (x - wdt + sl * ln, y + ln, z)]
        faces.append((b, b + 1, b + 2, b + 3))
    me.from_pydata(verts, [], faces)
    me.materials.append(mat)
    ob = bpy.data.objects.new("rain", me)
    ob.parent = cam
    link(ob, rain)
    return ob


# --------------------------------------------------------------------------
# Camera move
# --------------------------------------------------------------------------
def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * t * (t * (t * 6 - 15) + 10)


def lerp(a, b, t):
    return a + (b - a) * t


def cam_at(t, mobile):
    """Camera position and look-at target at normalised time t (0..1)."""
    s = smoothstep(0, 1, t)
    # glide down the avenue, then rise and tilt up to the mega-tower
    y = lerp(-6.0, 246.0, s)
    rise = smoothstep(0.48, 1.0, t)
    z = lerp(2.3, 4.2, smoothstep(0, 0.5, t)) + rise * (98.0 if not mobile else 92.0)
    x = 0.9 * math.sin(t * math.pi * 1.2) * (1 - rise)
    # target: far down the street at sign height, then the giant sign
    look = smoothstep(0.45, 0.98, t)
    ty = lerp(y + 80, END_Y + 9, look)
    tz = lerp(9.0 if not mobile else 13.0, 124.0 if not mobile else 118.0, look)
    tx = lerp(x * 0.4, 0.0, look)
    return Vector((x, y, z)), Vector((tx, ty, tz))


def animate_camera(scene, cam, target, rain, frames, mobile):
    for f in range(1, frames + 1):
        t = (f - 1) / max(1, frames - 1)
        p, q = cam_at(t, mobile)
        cam.location = p
        cam.keyframe_insert("location", frame=f)
        target.location = q
        target.keyframe_insert("location", frame=f)
        # rain sheet falls ~2.6 m per frame (wraps every 6 frames, seamless enough at scrub speed)
        rain.location = (0.0, -((f * 2.6) % 6.0), 0.0)
        rain.keyframe_insert("location", frame=f)
        # lens: slightly wider during the rise
        cam.data.lens = lerp(24 if not mobile else 18, 30 if not mobile else 22, smoothstep(0.55, 1.0, t))
        cam.data.keyframe_insert("lens", frame=f)
    for ob in (cam, target, rain):
        ad = ob.animation_data
        if ad and ad.action:
            for fc in _fcurves(ad.action):
                for kp in fc.keyframe_points:
                    kp.interpolation = "LINEAR"
    if cam.data.animation_data and cam.data.animation_data.action:
        for fc in _fcurves(cam.data.animation_data.action):
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"


def _fcurves(action):
    # Blender 4.4+ layered actions keep fcurves in channelbags
    if hasattr(action, "fcurves"):
        try:
            return list(action.fcurves)
        except Exception:
            pass
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for cb in getattr(strip, "channelbags", []):
                out += list(cb.fcurves)
    return out


# --------------------------------------------------------------------------
# Render setup
# --------------------------------------------------------------------------
def setup(args):
    scene = reset_scene()
    rnd = random.Random(2077)
    mobile = args.res == "mobile"
    scene.render.engine = "CYCLES"
    cy = scene.cycles
    cy.device = "CPU"
    cy.samples = args.samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.04
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
    scene.render.resolution_x = 540 if mobile else 1280
    scene.render.resolution_y = 960 if mobile else 720
    scene.render.resolution_percentage = args.scale
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.view_transform = "Standard"
    try:
        scene.view_settings.look = "Medium High Contrast"
    except Exception:
        pass
    scene.view_settings.exposure = 0.0
    scene.frame_start = 1
    scene.frame_end = args.frames

    mat_world(scene)
    build_city(scene, rnd)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 24
    cam_data.clip_end = 2000
    cam = bpy.data.objects.new("cam", cam_data)
    link(cam)
    scene.camera = cam
    target = bpy.data.objects.new("target", None)
    link(target)
    con = cam.constraints.new("TRACK_TO")
    con.target = target
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    rain = build_rain(scene, cam, rnd)
    animate_camera(scene, cam, target, rain, args.frames, mobile)
    if args.blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))
    return scene


def render(args):
    scene = setup(args)
    os.makedirs(args.out, exist_ok=True)
    start = args.start
    end = args.end or args.frames
    import time
    for f in range(start, end + 1):
        t0 = time.time()
        scene.frame_set(f)
        scene.render.filepath = os.path.join(args.out, f"{f:04d}.png")
        bpy.ops.render.render(write_still=True)
        print(f"frame {f}/{end} {time.time() - t0:.1f}s", flush=True)


def still(args):
    scene = setup(args)
    scene.frame_set(args.frame)
    scene.render.filepath = args.out
    import time
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    print(f"still frame {args.frame} {time.time() - t0:.1f}s", flush=True)


# --------------------------------------------------------------------------
# Post: bloom (multi-radius glow on the highlights), a little vignette, WebP.
# --------------------------------------------------------------------------
def post(args):
    import numpy as np
    from PIL import Image, ImageFilter

    os.makedirs(args.dst, exist_ok=True)
    files = sorted(f for f in os.listdir(args.src) if f.endswith(".png"))
    for idx, name in enumerate(files):
        im = Image.open(os.path.join(args.src, name)).convert("RGB")
        if args.size:
            tw, th = (int(v) for v in args.size.lower().split("x"))
            if im.size != (tw, th):
                im = im.resize((tw, th), Image.LANCZOS)
        a = np.asarray(im).astype(np.float32) / 255.0
        h, w, _ = a.shape
        luma = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
        hi = np.clip((luma - 0.55) / 0.45, 0, 1)[..., None] * a
        hi_im = Image.fromarray((hi * 255).astype(np.uint8))
        glow = np.zeros_like(a)
        for r, wgt in ((max(2, w // 320), 0.55), (max(4, w // 110), 0.45), (max(8, w // 40), 0.35)):
            small = hi_im.resize((w // 2, h // 2), Image.BILINEAR).filter(ImageFilter.GaussianBlur(r / 2))
            glow += np.asarray(small.resize((w, h), Image.BILINEAR)).astype(np.float32) / 255.0 * wgt
        out = 1 - (1 - a) * (1 - np.clip(glow, 0, 1))  # screen blend
        yy, xx = np.mgrid[0:h, 0:w]
        d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
        vig = 1 - 0.28 * np.clip(d - 0.55, 0, 1) ** 1.4
        # quiet bands for the overlaid copy, easing in over the last 30% of frames
        t = idx / max(1, len(files) - 1)
        k = np.clip((t - 0.7) / 0.3, 0, 1)
        k = k * k * (3 - 2 * k)
        v = yy / h
        band = np.maximum(np.clip(1 - v / 0.22, 0, 1), np.clip((v - 0.73) / 0.27, 0, 1))
        vig = vig * (1 - 0.55 * k * band ** 1.5)
        out = np.clip(out * vig[..., None], 0, 1)
        res = Image.fromarray((out * 255 + 0.5).astype(np.uint8))
        res.save(os.path.join(args.dst, name.replace(".png", ".webp")), "WEBP", quality=args.quality, method=6)
        if args.poster and name == files[0]:
            res.save(args.poster, "JPEG", quality=80, optimize=True, progressive=True)
    print(f"post: {len(files)} frames -> {args.dst}")


if __name__ == "__main__":
    a = args_from_cli()
    {"render": render, "still": still, "post": post}[a.mode](a)
