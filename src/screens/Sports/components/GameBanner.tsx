import React from "react";
import Animated from "react-native-reanimated";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useAuthContext } from "../../../contexts/AuthContext";
import { brLogo, stfxLogo } from "../../../../assets";
import colors from "../../../colors";
import { HomeStackParamList } from "../../../navigation";
import { useNavigation } from "@react-navigation/native";
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

const getLocation = (school: string) => {
    switch (school) {
        case "St. Thomas Aquinas":
            return "Oakville, ON"
        case "St. Ignatius of Loyola":
            return "Oavkille, ON";
        case "Notre Dame":
            return "Burlington, ON";
        case "Bishop Reding":
            return "Milton, ON";
        case "Holy Trinity":
            return "Oavkille, ON";
        case "Assumption":
            return "Burlington, ON";
        case "Corpus Christi":
            return "Burlington, ON";
        case "St. Francis Xavier":
            return "Milton, ON";
        case "St. Kateri Tekakwitha":
            return "Milton, ON";
        default:
            return "NA"
    }
}

const GameBanner = React.memo((
    { animatedSchool, homeScore, awayScore, home, away, league, theme }:
    { animatedSchool: any, homeScore: string, awayScore: string, home: string, away: string, league: string, theme: 'light' | 'dark' }
) => {
    const navigation = useNavigation<HomeStackParamList>();

    const testing = "12345";

    const correctFont = (testing).length > 2 ? ((testing).length > 4 ? 36 : 36) : 42

    return (
        <Animated.View
            style={[animatedSchool, {
                position: 'absolute', top: 80, left: 0, right: 0
            }]}
        >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', paddingHorizontal: 16 }}>
                <TouchableOpacity onPress={() => navigation.navigate("SportsTeam", {
                    team: home, league: league, org: "HCAA", 
                })} style={{ flex: 1, alignItems: 'center', minWidth: 50 }}>
                    <Image
                        source={schoolLogos[home as school]}
                        style={{
                            height: 64, aspectRatio: 1, marginBottom: 8, objectFit: 'contain'
                        }}
                    />
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: colors.text[theme].primary, textAlign: 'center' }}>
                        {home}
                    </Text>
                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, textAlign: 'center' }}>
                        {getLocation(home)}
                    </Text>
                </TouchableOpacity>

                {/* Center View */}
                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 0, paddingTop: 4, flexShrink: 1 }}>
                    <Text style={{ fontSize: correctFont, fontFamily: 'Figtree-ExtraBold', color: awayScore > homeScore ? colors.text[theme].secondary : colors.text[theme].primary }}>
                        {homeScore}
                    </Text>
                    <View style={{ width: 1, height: 32, backgroundColor: colors.fills['dark'].stroke, marginHorizontal: 14 }} />
                    <Text style={{ fontSize: correctFont, fontFamily: 'Figtree-ExtraBold', color: awayScore > homeScore ? colors.text[theme].secondary : colors.text[theme].primary }}>
                        {awayScore}
                    </Text>
                </View>

                {/* Right Side View */}
                <TouchableOpacity onPress={() => navigation.navigate("SportsTeam", {
                    team: away, league: league, org: "HCAA"
                })} style={{ flex: 1, alignItems: 'center', minWidth: 50 }}>
                    <Image
                        source={schoolLogos[away as school]}
                        style={{
                            height: 64, aspectRatio: 1, marginBottom: 8, objectFit: 'contain',
                        }}
                    />
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, color: colors.text[theme].primary, textAlign: 'center' }}>
                        {away}
                    </Text>
                    <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 13, lineHeight: 18, color: colors.text[theme].secondary, textAlign: 'center' }}>
                        {getLocation(away)}
                    </Text>
                </TouchableOpacity>

            </View>
        </Animated.View>
    )
});

export default GameBanner