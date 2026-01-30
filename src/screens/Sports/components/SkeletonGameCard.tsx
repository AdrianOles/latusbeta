import React from "react";
import { View, Text } from "react-native";
import colors from "../../../colors";

const Skeleton = React.memo(({ size, text, theme }: { size: number, text: string, theme: 'light' | 'dark'}) => {
    return (
        <View style={{
            display: 'flex',borderWidth: 0, marginBottom: 16, marginTop: 14}}>
            <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 18, lineHeight: 20, color: colors.text[theme].primary, paddingBottom: 16 }}>{text}</Text>
                

            <View style={{ backgroundColor: colors.background[theme].elevated, boxShadow: '0px 2px 24px 0px #73708014', borderRadius: 20 }}>
                {Array.from({ length: size }).map((_, index) => (
                    <View key={index} style={{ height: 96, width: '100%', borderRadius: 20 }}>
                    </View>
                ))}
            </View>
        </View>
    )
})
    
export const SkeletonGameCard = React.memo(Skeleton);