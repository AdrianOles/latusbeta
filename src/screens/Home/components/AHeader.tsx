import { Pressable, View, Text, TouchableOpacity } from "react-native";
import { AuthUserCustomType } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { HomeStackParamList } from "../../../navigation";
import { Announcement } from "../../../API";

interface AHeaderProps {
    authUser: AuthUserCustomType | null;
    theme: "light" | "dark";
    aFilter: "all" | "upcoming" | "new" | "ending" | "created";
    navigation: HomeStackParamList;
    itemLength: number;
    updateAFilter: (filter: "all" | "upcoming" | "new" | "ending" | "created") => void;
}

const AHeader = ({
    authUser,
    theme,
    aFilter,
    navigation,
    itemLength,
    updateAFilter,
}: AHeaderProps) => {
    const labelMaker = () => {
        switch (aFilter) {
            case "all":
                return "active";
            case "upcoming":
                return "scheduled";
            default:
                return aFilter
        }
    }

    return (
        <Pressable>
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', paddingLeft: 16, paddingVertical: 0, height: authUser?.staffRole === 'STUDENT' ? 76 : 'auto' }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 24, lineHeight: 29, color: colors.text[theme].primary, fontFamily: 'Figtree-Bold' }}>Announcements</Text>
                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Semibold', fontSize: 16, lineHeight: 21 }}>
                        {itemLength} {labelMaker()}
                    </Text>
                </View>
                {
                    (authUser?.staffRole != 'STUDENT' && (authUser?.school === "stfx" ? true : false)) && (
                        <TouchableOpacity onPress={() => navigation.navigate('ACreate', {})} style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 36, aspectRatio: 1, backgroundColor: colors.text[theme].primary, borderRadius: 250 }}>
                                <Ionicons name={'add'} size={24} color={colors.background[theme].general}></Ionicons>
                            </View>
                        </TouchableOpacity>
                    )
                }
            </View>
            <Pressable style={{ display: 'flex', flexDirection: 'row', borderBottomColor: colors.fills[theme].stroke, borderWidth: 0, position: 'relative', marginTop: 16 }}>
                <TouchableOpacity onPress={() => { updateAFilter('all'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} style={{ paddingVertical: 14, flexGrow: 1, width: '33%', borderColor: aFilter === 'all' ? colors.text[theme].primary : colors.fills[theme].stroke, borderBottomWidth: 1 }}>
                    <Text style={{ fontSize: 13, lineHeight: 18, letterSpacing: 0.28, textAlign: 'center', fontFamily: 'Figtree-Medium', color: aFilter === 'all' ? colors.text[theme].primary : colors.text[theme].secondary }}>
                        {
                            authUser?.staffRole.toUpperCase() === 'STUDENT' ? "All" : "Active"
                        }
                    </Text>
                </TouchableOpacity>
                {
                    authUser?.staffRole === 'ADMIN' && (
                        <TouchableOpacity onPress={() => { updateAFilter("upcoming"); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} style={{ paddingVertical: 14, flexGrow: 1, width: '33%', borderColor: aFilter === (authUser?.staffRole === 'ADMIN' ? "upcoming" : "new") ? colors.text[theme].primary : colors.fills[theme].stroke, borderBottomWidth: 1 }}>
                            <Text style={{ fontSize: 13, lineHeight: 18, letterSpacing: 0.28, textAlign: 'center', fontFamily: 'Figtree-Medium', color: aFilter === (authUser?.staffRole === 'ADMIN' ? "upcoming" : "new") ? colors.text[theme].primary : colors.text[theme].secondary }}>
                                Scheduled
                            </Text>
                        </TouchableOpacity>
                    )   
                }
                <TouchableOpacity onPress={() => { updateAFilter(authUser?.staffRole === 'STUDENT' ? 'new' : 'created'); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) }} style={{ paddingVertical: 14, flexGrow: 1, width: '33%', borderColor: aFilter === (authUser?.staffRole === 'STUDENT' ? 'new' : 'created') ? colors.text[theme].primary : colors.fills[theme].stroke, borderBottomWidth: 1 }}>
                    <Text style={{ fontSize: 13, lineHeight: 18, letterSpacing: 0.28, textAlign: 'center', fontFamily: 'Figtree-Medium', color: aFilter === (authUser?.staffRole === 'STUDENT' ? 'new' : 'created') ? colors.text[theme].primary : colors.text[theme].secondary, }}>
                        {
                            authUser?.staffRole === 'STUDENT' ? 'New' : 'Created'
                        }
                    </Text>
                </TouchableOpacity>
            </Pressable>
        </Pressable>
    )
}

export default AHeader