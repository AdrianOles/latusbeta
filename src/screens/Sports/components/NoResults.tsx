import React from "react";
import { View, Text } from "react-native";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';


const NoResults = ({theme, mainLabel, subLabel}: {theme: 'light' | 'dark', mainLabel: string, subLabel: string}) => {
    return (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 40}}>
            <Ionicons name='search-outline' size={90} color={colors.text[theme].secondary} style={{marginBottom: 8}} />
            <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 22, lineHeight: 26, color: colors.text[theme].primary}}>{mainLabel}</Text>
            <Text style={{ fontFamily: 'Figtree-Medium', fontSize: 17, lineHeight: 22, textAlign: 'center', color: colors.text[theme].secondary }}>{subLabel}</Text>
        </View>
    )
}

export default NoResults;