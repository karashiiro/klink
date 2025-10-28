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
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    setIsPaused(true);
    // Resume auto-rotation after 10 seconds of manual control
    setTimeout(() => setIsPaused(false), 10000);
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
void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;
    
    float pattern1 = cos(iTime * 0.5 + uv.x * 12.0) * cos(uv.y * 12.0);
    float pattern2 = cos(iTime + (uv.x + uv.y) * 12.0);
    vec2 center = uv - 0.5;
    float pattern3 = cos(length(center) * 15.0 - iTime * 2.0);
    float combinedPattern = (pattern1 + pattern2 + pattern3) / 3.0;
    
    float brightness = 0.7 + 0.3 * combinedPattern;
    
    vec3 coolColor = vec3(0.2, 0.6, 1.0);
    
    vec3 col = brightness * coolColor;
    fragColor = vec4(col, 1.0);
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
      primaryColor: "#2c3e50",
      secondaryColor: "#3498db",
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
      $type: "moe.karashiiro.klink.profile#colorBackground",
      type: "color",
      value: "#ff6b9d",
    },
    theme: {
      primaryColor: "#ffd93d",
      secondaryColor: "#6bcf7f",
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
