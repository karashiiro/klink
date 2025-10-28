import { useState, useEffect } from "react";
import { YStack, XStack } from "@tamagui/stacks";
import { ProfileDisplay, type ProfileData } from "./ProfileDisplay";
import { BackgroundRenderer } from "./BackgroundRenderer";
import { getBackgroundStyle } from "../../utils/backgroundUtils";

interface ExampleCarouselProps {
  autoRotateInterval?: number; // in milliseconds
}

export function ExampleCarousel({
  autoRotateInterval = 5000,
}: ExampleCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPausedByHover, setIsPausedByHover] = useState(false);
  const [isPausedByClick, setIsPausedByClick] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isPaused = isPausedByHover || isPausedByClick;

  // Auto-rotation with transition handling
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % demoProfiles.length);
        setIsTransitioning(false);
      }, 300); // Half of transition duration for crossfade
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [isPaused, autoRotateInterval]);

  const handleDotClick = (index: number) => {
    if (index === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
    }, 300);
    setIsPausedByClick(true);
    // Resume auto-rotation after 10 seconds of manual control
    setTimeout(() => setIsPausedByClick(false), 10000);
  };

  const activeProfile = demoProfiles[activeIndex];
  const backgroundStyle = getBackgroundStyle(activeProfile.background, "", "");

  return (
    <YStack gap="$4" alignItems="center" width="100%" maxWidth={800}>
      <YStack
        position="relative"
        width="100%"
        height={600}
        borderRadius="$4"
        overflow="hidden"
        style={{
          ...backgroundStyle,
          transition: "background-color 0.6s ease-in-out",
        }}
        padding="$4"
        alignItems="center"
        justifyContent="center"
        onMouseEnter={() => setIsPausedByHover(true)}
        onMouseLeave={() => setIsPausedByHover(false)}
      >
        <BackgroundRenderer background={activeProfile.background} />
        <div
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.6s ease-in-out",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ProfileDisplay profileData={activeProfile} handle="example.com" />
        </div>
      </YStack>
      <XStack gap="$2" alignItems="center">
        {demoProfiles.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            style={{
              width: activeIndex === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              backgroundColor:
                activeIndex === index
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            aria-label="View example"
          />
        ))}
      </XStack>
    </YStack>
  );
}

const demoShaderCode1 = `
// Animated gradient waves shader
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    // Create flowing waves
    float wave1 = sin(uv.x * 5.0 + iTime * 0.5) * 0.5 + 0.5;
    float wave2 = cos(uv.y * 5.0 + iTime * 0.3) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 3.0 + iTime * 0.7) * 0.5 + 0.5;

    // Mix colors based on waves
    vec3 color1 = vec3(0.2, 0.4, 0.8); // Blue
    vec3 color2 = vec3(0.8, 0.2, 0.6); // Pink
    vec3 color3 = vec3(0.3, 0.8, 0.7); // Cyan

    vec3 finalColor = mix(color1, color2, wave1);
    finalColor = mix(finalColor, color3, wave2 * wave3);

    // Add some shimmer
    float shimmer = sin(uv.x * 20.0 + iTime * 2.0) * sin(uv.y * 20.0 + iTime * 1.5);
    finalColor += shimmer * 0.1;

    fragColor = vec4(finalColor, 1.0);
}
  `.trim();

const demoShaderCode2 = `
float getPattern(vec2 sampleUV, float timeOffset) {
    float pattern = 0.0;
    
    vec2 grid1 = fract(sampleUV * 4.0 + (iTime - timeOffset) * 0.1);
    float pulse1 = 0.5 + 0.5 * sin((iTime - timeOffset) * 2.0);
    float shrink1 = 0.15 * pulse1;
    float square1 = step(0.2 + shrink1, grid1.x) * step(0.2 + shrink1, grid1.y);
    square1 *= step(grid1.x, 0.8 - shrink1) * step(grid1.y, 0.8 - shrink1);
    pattern += square1 * 0.25;
    
    vec2 grid2 = fract(sampleUV * 8.0 - (iTime - timeOffset) * 0.15);
    float pulse2 = 0.5 + 0.5 * cos((iTime - timeOffset) * 3.0 + 1.57);
    float shrink2 = 0.1 * pulse2;
    float square2 = step(0.3 + shrink2, grid2.x) * step(0.3 + shrink2, grid2.y);
    square2 *= step(grid2.x, 0.7 - shrink2) * step(grid2.y, 0.7 - shrink2);
    pattern += square2 * 0.2;
    
    vec2 grid3 = fract(sampleUV * 16.0 + (iTime - timeOffset) * 0.25);
    float pulse3 = 0.5 + 0.5 * sin((iTime - timeOffset) * 5.0);
    float square3 = step(0.35, grid3.x) * step(0.35, grid3.y);
    square3 *= step(grid3.x, 0.65) * step(grid3.y, 0.65);
    pattern += square3 * pulse3 * 0.12;
    
    return pattern;
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Kaleidoscope effect
vec2 kaleidoscope(vec2 uv, float segments) {
    uv -= 0.5;
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);
    float segmentAngle = 6.28318 / segments;
    angle = mod(angle, segmentAngle);
    angle = abs(angle - segmentAngle * 0.5) + segmentAngle * 0.5;
    uv = vec2(cos(angle), sin(angle)) * radius;
    uv += 0.5;
    return uv;
}

// Rotation + Zoom
vec2 rotateAndZoom(vec2 uv) {
    uv -= 0.5;
    float rotationSpeed = iTime * 0.3;
    float c = cos(rotationSpeed);
    float s = sin(rotationSpeed);
    mat2 rotationMatrix = mat2(c, -s, s, c);
    uv = rotationMatrix * uv;
    float zoomPulse = 1.0 + 0.15 * sin(iTime * 1.5);
    uv *= zoomPulse;
    uv += 0.5;
    return uv;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    
    vec2 aspectUV = uv;
    aspectUV -= 0.5;
    aspectUV.x *= iResolution.x / iResolution.y;
    aspectUV += 0.5;
    
    vec2 rotatedUV = rotateAndZoom(aspectUV);
    vec2 kaleidoUV = kaleidoscope(rotatedUV, 8.0);
    
    float hueTime = mod(iTime * 0.05, 1.0); // Cycles through 0-1 over 20 seconds
    
    // Time displacement trails
    vec3 col = vec3(0.0);
    
    for (int i = 0; i < 5; i++) {
        float timeOffset = float(i) * 0.15;
        float trailFade = 1.0 - (float(i) / 5.0);
        
        float aberrationAmount = 0.003 + 0.002 * sin(iTime * 2.0);
        
        vec2 redOffset = vec2(aberrationAmount, 0.0);
        vec2 greenOffset = vec2(0.0, 0.0);
        vec2 blueOffset = vec2(-aberrationAmount, 0.0);
        
        float patternRed = getPattern(kaleidoUV + redOffset, timeOffset);
        float patternGreen = getPattern(kaleidoUV + greenOffset, timeOffset);
        float patternBlue = getPattern(kaleidoUV + blueOffset, timeOffset);
        
        float trailHue = mod(hueTime + float(i) * 0.1, 1.0);
        
        // Create three color variations for the pattern using HSV
        vec3 color1 = hsv2rgb(vec3(trailHue, 0.7, 0.8));
        vec3 color2 = hsv2rgb(vec3(mod(trailHue + 0.33, 1.0), 0.6, 0.7));
        vec3 color3 = hsv2rgb(vec3(mod(trailHue + 0.66, 1.0), 0.65, 0.75));
        
        // Mix colors for variety
        vec3 patternColor = mix(color2, color3, sin(iTime * 0.5) * 0.5 + 0.5);
        
        vec3 layerCol = vec3(0.0);
        layerCol.r += patternRed * patternColor.r * 0.4;
        layerCol.g += patternGreen * patternColor.g * 0.4;
        layerCol.b += patternBlue * patternColor.b * 0.4;
        
        layerCol.r += patternRed * color1.r * (0.1 + 0.1 * sin(iTime * 2.0));
        layerCol.g += patternGreen * color1.g * (0.1 + 0.1 * sin(iTime * 2.0));
        layerCol.b += patternBlue * color1.b * (0.1 + 0.1 * sin(iTime * 2.0));
        
        col += layerCol * trailFade * 0.4;
    }
    
    float baseBrightness = 0.5 + 0.15 * cos(iTime + kaleidoUV.x + kaleidoUV.y);
    vec3 baseColor = hsv2rgb(vec3(hueTime, 0.5, baseBrightness));
    col += baseColor * 0.3;
    
    // CRT scanlines
    float scanline = sin(uv.y * iResolution.y * 1.0) * 0.04;
    col -= scanline;
    
    // Vignette
    vec2 vignetteUV = uv * 2.0 - 1.0;
    float vignette = 1.0 - dot(vignetteUV, vignetteUV) * 0.3;
    col *= vignette;
    
    col *= 1.1;
    
    fragColor = vec4(col, 1.0);
}
  `.trim();

const demoShaderCode3 = `
// Hash function for pseudo-random values
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Smooth noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion for ocean waves
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for(int i = 0; i < 5; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

// Ocean height function with animated waves
float getOceanHeight(vec2 p, float t) {
    float h = 0.0;
    
    // Big swells
    h += sin(p.x * 0.3 + t * 0.5) * cos(p.y * 0.2 + t * 0.4) * 0.3;
    
    // Medium waves
    h += sin(p.x * 0.8 - t * 0.8) * sin(p.y * 0.6 + t * 0.6) * 0.15;
    
    // Small ripples using FBM
    h += fbm(p * 0.5 + t * 0.2) * 0.1;
    
    return h;
}

// Raymarch the ocean surface
float traceOcean(vec3 ro, vec3 rd, float t) {
    float dist = 0.0;
    
    for(int i = 0; i < 64; i++) {
        vec3 p = ro + rd * dist;
        float h = getOceanHeight(p.xz, t);
        float diff = p.y - h;
        
        if(abs(diff) < 0.001 || dist > 100.0) break;
        
        dist += diff * 0.5;
    }
    
    return dist;
}

// Calculate normal for lighting
vec3 getNormal(vec2 p, float t) {
    float eps = 0.01;
    float h = getOceanHeight(p, t);
    float hx = getOceanHeight(p + vec2(eps, 0.0), t);
    float hz = getOceanHeight(p + vec2(0.0, eps), t);
    
    return normalize(vec3(h - hx, eps, h - hz));
}

// Sky gradient with sun
vec3 getSky(vec3 rd, vec3 sunDir) {
    // Gradient from horizon to sun zenith
    float sunDot = max(dot(rd, sunDir), 0.0);
    
    // Sky color
    vec3 skyColor = mix(
        vec3(0.5, 0.7, 1.0),      // Horizon color (light blue)
        vec3(0.1, 0.3, 0.6),      // Zenith color (deeper blue)
        pow(1.0 - max(rd.y, 0.0), 0.8)
    );
    
    // Add glow
    vec3 sunColor = vec3(1.0, 0.9, 0.7) * pow(sunDot, 32.0) * 3.0;
    sunColor += vec3(1.0, 0.8, 0.6) * pow(sunDot, 8.0) * 0.5;
    
    return skyColor + sunColor;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    
    // Camera setup
    float camAngle = iTime * 0.1;
    vec3 ro = vec3(sin(camAngle) * 3.0, 1.5, cos(camAngle) * 3.0);
    vec3 target = vec3(0.0, 0.8, 0.0);
    
    vec3 forward = normalize(target - ro);
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
    vec3 up = cross(forward, right);
    
    vec3 rd = normalize(forward + uv.x * right + uv.y * up);
    
    // Sun direction
    vec3 sunDir = normalize(vec3(0.3, 0.5, 0.8));
    
    // Trace the ocean
    float dist = traceOcean(ro, rd, iTime);
    
    vec3 color;
    
    if(dist < 100.0) {
        vec3 p = ro + rd * dist;
        vec3 normal = getNormal(p.xz, iTime);
        
        // Colors
        vec3 oceanDeep = vec3(0.0, 0.2, 0.4);
        vec3 oceanShallow = vec3(0.1, 0.5, 0.6);
        
        // Lighting
        float diffuse = max(dot(normal, sunDir), 0.0);
        float fresnel = pow(1.0 - max(dot(normal, -rd), 0.0), 3.0);
        
        // Reflect sky in the water
        vec3 reflectDir = reflect(rd, normal);
        vec3 skyReflection = getSky(reflectDir, sunDir);
        
        // Mix ocean color with lighting
        color = mix(oceanDeep, oceanShallow, diffuse * 0.5 + 0.5);
        color *= diffuse * 0.8 + 0.2;
        
        // Add fresnel reflection
        color = mix(color, skyReflection, fresnel * 0.8);
        
        // Specular highlight from sun
        vec3 halfVec = normalize(sunDir - rd);
        float specular = pow(max(dot(normal, halfVec), 0.0), 128.0);
        color += vec3(1.0, 0.95, 0.8) * specular * 2.0;
        
    } else {
        // Missed the ocean, render sky
        color = getSky(rd, sunDir);
    }
    
    // Tone mapping and gamma correction
    color = pow(color, vec3(0.4545));
    
    fragColor = vec4(color, 1.0);
}
  `.trim();

// Demo profiles showcasing different styles
const demoProfiles: ProfileData[] = [
  {
    $type: "moe.karashiiro.klink.profile",
    name: "Your Name",
    location: "Your Location",
    bio: "A brief description about yourself and what you do.",
    profileImage: {
      $type: "moe.karashiiro.klink.profile#urlImage",
      type: "url",
      value: "https://api.dicebear.com/7.x/shapes/svg?seed=wy4wa",
    },
    background: {
      $type: "moe.karashiiro.klink.profile#shaderBackground",
      type: "shader",
      // BackgroundRenderer handles regular Blob instances for preview
      value: new Blob([demoShaderCode1], { type: "text/plain" }),
    },
    theme: {
      primaryColor: "#ffffff",
      secondaryColor: "#a0e7ff",
      fontFamily: '"Bitcount Grid Single", system-ui',
      stylesheet:
        '@import url("https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&display=swap");',
    },
    links: [
      {
        label: "Link 1",
        href: "",
      },
      {
        label: "Link 2",
        href: "",
      },
      {
        label: "Link 3",
        href: "",
      },
    ],
  },
  {
    $type: "moe.karashiiro.klink.profile",
    name: "Your Name",
    location: "Your Location",
    bio: "A brief description about yourself and what you do.",
    profileImage: {
      $type: "moe.karashiiro.klink.profile#urlImage",
      type: "url",
      value: "https://api.dicebear.com/7.x/shapes/svg?seed=9m08u",
    },
    background: {
      $type: "moe.karashiiro.klink.profile#shaderBackground",
      type: "shader",
      value: new Blob([demoShaderCode2], { type: "text/plain" }),
    },
    theme: {
      primaryColor: "#68390388",
      secondaryColor: "#ffc400c2",
      fontFamily: "sans-serif",
    },
    links: [
      {
        label: "Link 1",
        href: "",
      },
      {
        label: "Link 2",
        href: "",
      },
      {
        label: "Link 3",
        href: "",
      },
    ],
  },
  {
    $type: "moe.karashiiro.klink.profile",
    name: "Your Name",
    location: "Your Location",
    bio: "A brief description about yourself and what you do.",
    profileImage: {
      $type: "moe.karashiiro.klink.profile#urlImage",
      type: "url",
      value: "https://api.dicebear.com/7.x/shapes/svg?seed=m6yr5",
    },
    background: {
      $type: "moe.karashiiro.klink.profile#shaderBackground",
      type: "shader",
      value: new Blob([demoShaderCode3], { type: "text/plain" }),
    },
    theme: {
      primaryColor: "#00d9ff8f",
      secondaryColor: "#006effff",
      fontFamily: '"Noto Sans", sans-serif',
      stylesheet:
        "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');",
    },
    links: [
      {
        label: "Link 1",
        href: "",
      },
      {
        label: "Link 2",
        href: "",
      },
      {
        label: "Link 3",
        href: "",
      },
      {
        label: "Link 4",
        href: "",
      },
    ],
  },
];
