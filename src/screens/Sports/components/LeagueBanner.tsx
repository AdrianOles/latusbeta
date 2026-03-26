import React from "react";
import Animated from "react-native-reanimated";
import { View, Text, TouchableOpacity, Linking } from "react-native";
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
            <TouchableOpacity onPress={() => Linking.openURL('https://www.hcaa.ca')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16 }}>
                <Image
                    source={require('../../../../assets/schools/hcaa.png')}
                    style={{
                        height: 64, aspectRatio: 1, marginBottom: 8
                    }}
                    contentFit="contain"
                    transition={300}
                />
                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Bold', fontSize: 22, color: colors.text['dark'].primary, marginTop: 8 }}>{abbreviatedLabel}</Text>
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Text maxFontSizeMultiplier={1.2} style={{fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 20, color: colors.text['dark'].secondary}}>{subNote}</Text>
                    <Ionicons name="chevron-forward-outline" size={12} color={colors.text['dark'].secondary} style={{marginLeft: 4, paddingTop: 2}} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
});

export default LeagueBanner