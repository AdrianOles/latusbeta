import { MeshGradientView } from "expo-mesh-gradient";
import { View, Text } from "react-native";
import colors from "../colors";
import React from "react";

// Define 7 distinct color palettes for the gradient
const colorVariants = [
    ['#c1a34fff', '#E6C773', '#E6C773', '#732e0b8f'], // Variant 1 (Original)
    ['#800643', '#E66E6E', '#E66E6E', '#8006438f'], // Variant 2 (Warm & Earthy)
    ['#404040', '#CCCCCC', '#CCCCCC', '#4040408f'], // Variant 3 (Cool Tones)
    ['#7F0D46', '#E673CF', '#E673CF', '#7F0D468f'], // Variant 4 (Pastel)
    ['#0D7F7F', '#73E6BA', '#73E6BA', '#0D7F7F8f'], // Variant 5 (Grayscale)
    ['#0F0F80', '#99BBFF', '#99BBFF', '#0F0F808f'], // Variant 6 (Vibrant)
    ['#444EA8', '#C6D3FF', '#C6D3FF', '#444EA88f']  // Variant 7 (Soft & Bright)
];

const ProfileGen = React.memo(({ theme, initials, width, font, focused }: { theme: 'light' | 'dark', initials: string | undefined, width: number, font:number, focused?: boolean }) => {

    // Check if initials exist and are not empty
    if (!initials) {
        return null;
    }

    // Get the first character and convert to uppercase
    const firstChar = initials.toUpperCase().charCodeAt(0);

    // Determine the color variant index using the character code
    const variantIndex = firstChar % colorVariants.length;
    const selectedColors = colorVariants[variantIndex];

    return (
        <View style={{
            width: width, aspectRatio: 1, justifyContent: 'center',
            alignItems: 'center', position: 'relative', borderWidth: 1,
            borderColor: focused ? colors.text[theme].primary : colors.fills[theme].stroke, borderRadius: 250, overflow: 'hidden'
        }}>
            <Text style={{
                textTransform: 'uppercase', fontSize: font, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.4, zIndex: 10,
                color: 'white',
            }}>
                {initials}
            </Text>
            <MeshGradientView
                style={{ height: width, width: width, position: 'absolute' }}
                columns={2}
                rows={2}
                colors={selectedColors} // Use the colors determined by the initials
                points={[
                    [0.0, 0.0], // Top-left corner
                    [1.0, 0.0], // Top-right corner
                    [0.0, 1.0], // Bottom-left corner
                    [1.0, 1.0]  // Bottom-right corner
                ]}
            />
        </View>
    )
})

export default React.memo(ProfileGen);