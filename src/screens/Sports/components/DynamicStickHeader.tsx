import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, Text, Share, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Animated from "react-native-reanimated";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../../../navigation";
import colors from "../../../colors";
import * as Haptics from 'expo-haptics';

const getShareUrl = () => {
    const path = `/sports/game?gameid=`
    const url = new URL(path, "https://latus.ca")
    return url.toString()
}

const shareNatively = async () => {
    return await Share.share({ message: getShareUrl() })
}

const reorderString = (inputString: string): string => {
    if (!inputString || typeof inputString !== 'string') {
        return '';
    }
    const words = inputString.split(' ');

    if (words.length <= 1) {
        return inputString;
    }
    const lastWord = words.pop();
    const remainingWords = words.join(' ');

    return `${lastWord} - ${remainingWords}`;
};


const DynamicStickHeader = React.memo((
    { stickyHeaderAnim, subNote, label, mode, posting, theme }:
        {
            stickyHeaderAnim?: any, label: string, subNote?: string, mode: "game" | "league" | "team",
            posting?: () => void, theme: 'light' | 'dark'
         }) => {
    const navigation = useNavigation<HomeStackParamList>(); // If GameCard needs navigation
    const [following, setFollowing] = useState<boolean>(false);
    const [leftWidth, setLeftWidth] = useState<number>(90);
    const { authUser } = useAuthContext();

    const abbreviatedLabel = label.replace(/\bSenior\b/g, 'Sr.').replace(/\bJunior\b/g, 'Jr.');


    const handleFollow = () => {
        if (following){
            // setFollowing(false);
            navigation.navigate("SportsNotifications")
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFollowing(true);
        }
    }

    return (
        <View style={{ paddingHorizontal: 16, paddingVertical: Platform.OS === 'android' ? 0 : 4, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative', width: '100%' }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 50, zIndex: 10, flexShrink: 1 }}>
                    <Ionicons name='chevron-back-outline' color={colors.text[theme].primary} size={32} style={{marginRight: 'auto'}} />
                </TouchableOpacity>
                <Animated.View style={[stickyHeaderAnim, { display: 'flex', flexDirection: 'column', flexGrow: 1, flex: 1, zIndex: 1 }]}>
                    <Text maxFontSizeMultiplier={1.2} numberOfLines={1} style={{ color: colors.text[theme].primary, fontSize: 17, lineHeight: 22, fontFamily: 'Figtree-Bold', marginLeft: 8, textAlign: 'center' }}>
                        {mode === 'game' || mode === 'league' ? reorderString(abbreviatedLabel) : abbreviatedLabel}
                    </Text>
                </Animated.View>
                {/* <View style={[{ display: 'flex', flexDirection: 'column', flexGrow: 1, flex: 1, zIndex: 1 }]}>
                    <Text numberOfLines={1} style={{ color: colors.text[theme].primary, fontSize: 17, lineHeight: 22, fontFamily: 'Figtree-Bold', marginLeft: 8, textAlign: 'center' }}>
                        {mode === 'game' || mode === 'league' ? reorderString(label) : label}
                    </Text>
                </View> */}
                <View style={{ width: 50, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingVertical: 10, }}>
                    {/* {mode === 'game' && authUser && (
                        <>
                            <TouchableOpacity onPress={posting} style={{  paddingHorizontal: 10, zIndex: 10 }}>
                                <Ionicons name="create-outline" size={24} color={colors.text[theme].primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => shareNatively()} style={{ paddingHorizontal: 10, zIndex: 10 }}>
                                <Ionicons name="share-outline" size={24} color={colors.text[theme].primary} />
                            </TouchableOpacity>
                        </>
                    )} */}

                </View>
            </View>
        </View>
    )
});

export default DynamicStickHeader;