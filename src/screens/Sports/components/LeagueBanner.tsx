import React from "react";
import Animated from "react-native-reanimated";
import { View, Text, Image } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';

const LeagueBanner = React.memo(({ animatedSchool, label, subNote }: { animatedSchool: any, label: string, subNote: string }) => {
    const { theme } = useAuthContext();

    return (
        <Animated.View
            style={[animatedSchool, {
                position: 'absolute', top: 80, left: 0, right: 0
            }]}
        >
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16 }}>
                <Ionicons name="football" size={60} color={colors.text['dark'].secondary} />
                <Text style={{fontFamily: 'Figtree-Bold', fontSize: 20, color: colors.text['dark'].primary, marginTop: 8}}>{label}</Text>
                <Text style={{fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text['dark'].secondary}}>{subNote}</Text>
            </View>
        </Animated.View>
    )
});

export default LeagueBanner