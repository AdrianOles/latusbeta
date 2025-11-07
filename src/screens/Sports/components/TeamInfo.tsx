import React from "react";
import { TouchableOpacity, View, Text, Dimensions, ScrollView, Linking, Image } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import Tab from "./Tab";
import { Ionicons } from '@expo/vector-icons';
import { school } from "..";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const getPhoto = (school: string) => {
    switch (school) {
        case "St. Thomas Aquinas":
            return "https://b1352154.smushcdn.com/1352154/wp-content/uploads/2023/09/hcdsb-secondary-logo_assumption.png?lossy=0&strip=1&webp=1"
        case "St. Ignatius of Loyola":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-Loyola_Loyola.png";
        case "Notre Dame":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-ND_NotreDame.png";
        case "Bishop Reding":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-BR_BishopReding.png";
        case "Holy Trinity":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-HT_HolyTrinity.png";
        case "Assumption":
            return "https://b1352154.smushcdn.com/1352154/wp-content/uploads/sites/5/2022/05/Logo-Assumption-Crusaders-Circle-Pantone-2965C-darker.png?lossy=0&strip=1&webp=1";
        case "Corpus Christi":
            return "https://elem.hcdsb.org/wp-content/uploads/2021/06/logo_hcdsb_FOS-Corpus_CorpusChristi.png";
        case "St. Francis Xavier":
            return "https://upload.wikimedia.org/wikipedia/commons/3/3b/St._Francis_Xavier_Milton_emblem.png";
        case "St. Kateri Tekakwitha":
            return "https://www.hcdsb.org/wp-content/uploads/2021/07/Logo_StKateri_web_small.png";
        default:
            return "https://upload.wikimedia.org/wikipedia/commons/3/3b/St._Francis_Xavier_Milton_emblem.png"
    }
}

const TeamInfo = React.memo(({team, league} : {team: school, league: string}) => {
    const { theme } = useAuthContext();

    const handlePress = () => {
        Linking.openURL('https://hcaa.ca').catch(err => console.error("Couldn't load page", err));
    };

    return (
        <ScrollView style={{ display: 'flex', flexDirection: 'column', minWidth: SCREEN_WIDTH, maxWidth: SCREEN_WIDTH , paddingHorizontal: 16 }}>
            <Text style={{
                textAlign: 'center', marginBottom: 16, color: colors.text[theme].secondary, paddingVertical: 12,
                lineHeight: 20, fontSize: 15, fontFamily: 'Figtree-Medium'
            }}>
                Catholic Secondary School
            </Text>
            <View style={{
                display: 'flex', flexDirection: 'row', borderWidth: 1, padding: 16, alignItems: 'center',marginBottom: 16,
                borderColor: colors.fills[theme].stroke, borderRadius: 250, justifyContent: 'space-between'
            }}>
                <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary}}>
                    Location
                </Text>
                <View style={{
                    borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                    alignItems: 'center', backgroundColor: colors.background[theme].second
                }}>
                    <Ionicons name="location" size={20} style={{marginRight: 4}} color={colors.text[theme].secondary} />
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{team}</Text>
                </View>
            </View>
            <View style={{
                display: 'flex', flexDirection: 'row', borderWidth: 1, padding: 16, alignItems: 'center', marginBottom: 16,
                borderColor: colors.fills[theme].stroke, borderRadius: 250, justifyContent: 'space-between'
            }}>
                <Text style={{ fontFamily: "Figtree-Medium", fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>
                    League
                </Text>
                <View style={{
                    borderRadius: 250, paddingHorizontal: 8, paddingVertical: 4, display: 'flex', flexDirection: 'row',
                    alignItems: 'center', backgroundColor: colors.background[theme].second
                }}>
                    <Ionicons name="football" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].secondary }}>{league}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={handlePress} style={{
                display: 'flex', flexDirection: 'row', borderWidth: 1, padding: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 12,
                borderColor: colors.fills[theme].stroke, borderRadius: 24, justifyContent: 'space-between',
            }}>
                <View style={{
                    display: 'flex', flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <View style={{ width: 24, aspectRatio: 1, marginRight: 8 }}>
                        <Image
                            source={{ uri: getPhoto(team)}}
                            style={{ height: 24, aspectRatio: 1, marginBottom: 8, objectFit: 'contain' }}
                        />
                    </View>
                    <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.text[theme].primary }}>{team}</Text>
                </View>
                <Ionicons name="arrow-forward-outline" size={20} style={{ marginRight: 4 }} color={colors.text[theme].secondary} />
            </TouchableOpacity>
            <View style={{height: 600, width: 'auto'}} />
        </ScrollView>
    );
});

export default TeamInfo;