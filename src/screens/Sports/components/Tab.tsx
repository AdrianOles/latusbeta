import React from "react";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";
import colors from "../../../colors";
import { TouchableOpacity } from "react-native";


const Tab = React.memo((
    { label, index, theme, activePageIndex, onTabPress }:
        { label: string, index: number, theme: 'light' | 'dark', activePageIndex: SharedValue<number>, onTabPress: (index: number) => void }
) => {
    
    // This hook is now safely at the top level of the Tab component
    const tabStyle = useAnimatedStyle(() => {
        const isActive = activePageIndex.value === index;
        return {
            borderBottomWidth: isActive ? 3 : 0,
            borderColor: isActive ? colors.text[theme].primary : 'transparent',
        };
    });

    const tabTextStyle = useAnimatedStyle(() => {
        const isActive = activePageIndex.value === index;
        return {
            opacity: isActive ? 1 : 0.5,
        };
    });

    return (
        <TouchableOpacity onPress={() => onTabPress(index)} style={{ padding: 16, flexGrow: 1, zIndex: 50 }}>
            <Animated.Text style={[{ fontFamily: "Figtree-Bold", textAlign: 'center', fontSize: 15, lineHeight: 20, color: colors.text[theme].primary }, tabTextStyle]}>
                {label}
            </Animated.Text>
            <Animated.View style={[{ height: 4, borderRadius: 1.5, position: 'absolute', bottom: 1, left: 0, right: 0}, tabStyle]} />
        </TouchableOpacity>
    );
});

export default Tab