export const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] }
  },
  
  morphText: {
    initial: { scale: 0.8, rotationX: -90, opacity: 0 },
    animate: { scale: 1, rotationX: 0, opacity: 1 },
    transition: { duration: 1.5, ease: [0.23, 1, 0.32, 1] }
  },

  floatingCard: {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  skillCard3D: {
    initial: { opacity: 0, rotationY: -45, z: -100 },
    animate: { opacity: 1, rotationY: 0, z: 0 },
    whileHover: { 
      rotationY: 10, 
      rotationX: 10, 
      z: 50,
      transition: { duration: 0.3 }
    }
  },

  liquidMorph: {
    animate: {
      borderRadius: ["20px", "50%", "20px 50% 20px 50%", "50% 20px 50% 20px", "20px"],
      scale: [1, 1.05, 0.95, 1.05, 1],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};
