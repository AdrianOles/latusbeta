import React from "react";
import Animated from "react-native-reanimated";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import { school } from "..";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";

const getSchoolName = (school: string) => {
    switch (school) {
        case "STFX":
            return "St. Francis Xavier"
        case "STK":
            return "St. Kateri Tekakwitha"
        case "LOY":
            return "St. Ignatius of Loyola"
        case "ND":
            return "Notre Dame"
        case "AS":
            return "Assumption"
        case "BR":
            return "Bishop Reding"
        case "CTK":
            return "Christ the King"
        case "CC":
            return "Corpus Christi"
        case "HT":
            return "Holy Trinity"
        case "STA":
            return "St. Thomas Aquinas"
        default:
            return undefined;
    }
}

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

const MySchoolCard = React.memo(({ school }: { school: string }) => {
    const { theme } = useAuthContext();
    const sch = getSchoolName(school);
    const navigation = useNavigation<HomeStackParamList>();

    return (
        <TouchableOpacity onPress={() => navigation.navigate("SportsMySchool")} style={{
            display: 'flex', padding: 16, flexDirection: 'row', alignItems: 'center',
            boxShadow: "0px 2px 24px 0px #73708014", borderRadius: 20,
            marginBottom: 12, backgroundColor: colors.background[theme].elevated
        }}>
            <Image
                source={schoolLogos[sch as school]}
                style={{
                    height: 32, width: 32, aspectRatio: 1, objectFit: 'contain',
                    marginRight: 4
                }}
            />
            <View>
                <Text style={{fontFamily: "Figtree-Regular", fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary}}>Happening today</Text>
                <Text style={{ color: colors.text[theme].primary, fontFamily: 'Figtree-Bold', fontSize: 15, lineHeight: 20 }}>{sch}</Text>
            </View>
            <Ionicons name='arrow-forward-outline' size={20} color={colors.text[theme].secondary} style={{marginLeft: 'auto'}} />
        </TouchableOpacity>
    )
});

export default MySchoolCard