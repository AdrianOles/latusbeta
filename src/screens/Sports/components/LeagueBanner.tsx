import React from "react";
import Animated from "react-native-reanimated";
import { View, Text } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";

const LeagueBanner = React.memo(({ animatedSchool, label, subNote }: { animatedSchool: any, label: string, subNote: string }) => {
    const abbreviatedLabel = label.replace(/\bSenior\b/g, 'Sr.').replace(/\bJunior\b/g, 'Jr.');
    
    return (
        <Animated.View
            style={[animatedSchool, {
                position: 'absolute', top: 76, left: 0, right: 0
            }]}
        >
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16 }}>
                <Image
                    source={require('../../../../assets/schools/hcaa.png')}
                    style={{
                        height: 64, aspectRatio: 1, marginBottom: 8
                    }}
                    contentFit="contain"
                    transition={300}
                />
                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Bold', fontSize: 22, color: colors.text['dark'].primary, marginTop: 8 }}>{abbreviatedLabel}</Text>
                <Text maxFontSizeMultiplier={1.2} style={{fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 20, color: colors.text['dark'].secondary}}>{subNote}</Text>
            </View>
        </Animated.View>
    )
});

export default LeagueBanner