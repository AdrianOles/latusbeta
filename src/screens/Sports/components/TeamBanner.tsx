import React from "react";
import Animated from "react-native-reanimated";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";
import { school } from "..";

const schoolLogos = {
    "St. Thomas Aquinas": require('../../../../assets/schools/sta.png'),
    "St. Ignatius of Loyola": require('../../../../assets/schools/loy.png'),
    "Notre Dame": require('../../../../assets/schools/nd.png'),
    "Bishop Reding": require('../../../../assets/schools/br.png'),
    "Holy Trinity": require('../../../../assets/schools/ht.png'),
    "Assumption": require('../../../../assets/schools/as.png'),
    "Corpus Christi": require('../../../../assets/schools/cc.png'),
    "St. Francis Xavier": require('../../../../assets/schools/stfx.png'),
    "St. Kateri Tekakwitha": require('../../../../assets/schools/stk.png'),
    "Christ the King": require('../../../../assets/schools/ctk.png'),
};

const TeamBanner = React.memo(({ animatedSchool, label, subNote }: { animatedSchool: any, label: string, subNote: string }) => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>();

    const abbreviatedSubNote = subNote.replace(/\bSenior\b/g, 'Sr.').replace(/\bJunior\b/g, 'Jr.');

    return (
        <Animated.View
            style={[animatedSchool, {
                position: 'absolute', top: 54, left: 0, right: 0
            }]}
        >
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 16 }}>
                <Image
                    source={schoolLogos[label as school]}
                    style={{
                        height: 80, aspectRatio: 1, objectFit: 'contain',
                    }}
                />
                <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-Bold', fontSize: 22, color: colors.text['dark'].primary, marginTop: 8 }}>{label}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SportsLeague", { league: subNote, org: "HCAA" })}>
                    <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 20, color: colors.text['dark'].secondary }}>{abbreviatedSubNote} &rsaquo;</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    )
});

export default TeamBanner