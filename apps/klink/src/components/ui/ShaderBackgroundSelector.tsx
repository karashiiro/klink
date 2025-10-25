import { YStack } from "@tamagui/stacks";
import { Paragraph } from "@tamagui/text";
import { useAtom } from "jotai";
import { profileAtom } from "../../atoms/profile";

export function ShaderBackgroundSelector() {
  const [formData, setFormData] = useAtom(profileAtom);

  return (
    <YStack gap="$3">
      <Paragraph color="white" fontWeight="bold" fontSize="$4">
        Shader Code (GLSL)
      </Paragraph>

      <textarea
        value={formData.backgroundShaderCode}
        onChange={(e) => {
          setFormData({
            ...formData,
            backgroundShaderCode: e.target.value,
          });
        }}
        placeholder={`void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}`}
        rows={15}
        className="hide-scrollbar"
        style={{
          width: "288px",
          padding: "12px",
          fontFamily: "monospace",
          fontSize: "13px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          color: "white",
          resize: "vertical",
        }}
      />

      <YStack gap="$1">
        <Paragraph color="rgba(255, 255, 255, 0.8)" fontSize="$2">
          Available ShaderToy uniforms:
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iResolution (vec3) - viewport resolution (width, height, aspect)
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iTime (float) - shader playback time in seconds
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iTimeDelta (float) - render time in seconds
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iFrameRate (float) - shader frame rate
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iFrame (int) - shader playback frame
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iChannelTime[4] (float) - channel playback time (always 0)
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iChannelResolution[4] (vec3) - channel resolution (always 0)
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iMouse (vec4) - mouse coords (xy: current, zw: click)
        </Paragraph>
        <Paragraph
          color="rgba(255, 255, 255, 0.6)"
          fontSize="$2"
          style={{ fontFamily: "monospace" }}
        >
          • iDate (vec4) - year, month, day, time in seconds
        </Paragraph>
      </YStack>

      <Paragraph color="rgba(255, 255, 255, 0.5)" fontSize="$2">
        Write a GLSL fragment shader compatible with ShaderToy. Your shader must
        implement the mainImage function.
      </Paragraph>
    </YStack>
  );
}
