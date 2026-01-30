import React from "react";
import Animated from "react-native-reanimated";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, loglogo } from "../../../../assets";
import colors from "../../../colors";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const SignInBanner = React.memo(({ animation }: { animation: any }) => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();

    return (
        <Animated.View style={[{
            position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.background[theme].elevated, width: '100%',
        }]}>
            <View style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: colors.fills[theme].subtle
            }}>
                <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1, // <--- IMPORTANT: Allow this section to take up available space
                }}>
                    {/* <View style={{ width: 24, height: 24, marginRight: 8 }}>
                        <Svg width="100%" height="100%" viewBox="0 0 708 516" fill="true">
                            <Path d="M531.567 370.885L411.211 492.017C379.438 523.994 327.867 523.994 296.026 492.017L15.1041 209.216C-5.03468 188.947 -5.03468 156.148 15.1041 135.879C35.2428 115.611 67.8322 115.611 87.9709 135.879L324.805 374.24C340.726 390.263 366.579 390.263 382.568 374.24L458.769 297.548C461.15 295.152 465.028 295.152 467.409 297.548L531.703 362.257C534.085 364.654 534.085 368.557 531.703 370.953L531.567 370.885Z" fill={colors.text[theme].primary} fill-opacity="0.65" />
                            <Path d="M692.545 380.463C672.406 400.732 639.817 400.732 619.678 380.463L382.504 141.829C366.583 125.805 340.729 125.805 324.741 141.829L249.153 217.904C246.431 220.643 242.009 220.643 239.287 217.904L176.218 154.428C173.496 151.689 173.496 147.238 176.218 144.499L296.03 23.9833C327.803 -7.99444 379.374 -7.99444 411.215 23.9833L692.545 307.127C712.684 327.395 712.684 360.195 692.545 380.463Z" fill={colors.text[theme].primary} fill-opacity="0.65" />
                        </Svg>
                    </View> */}
                    <Text style={{
                        color: colors.text[theme].primary,
                        fontFamily: 'Figtree-Regular',
                        fontSize: 17,
                        lineHeight: 22,
                        flexShrink: 1
                    }}>
                        Are you a student or staff member of HCDSB?
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Signin")}
                    style={{
                        marginLeft: 16,
                        borderRadius: 250,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <LinearGradient
                        colors={[colors.fills[theme].ctaFirst, colors.fills[theme].ctaSecond]}
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                    />
                    <Text style={{
                        color: colors.system.white, fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 22, paddingVertical: 9,
                        paddingHorizontal: 18, }}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
});

export default SignInBanner