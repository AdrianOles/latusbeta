import React from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from "react-native-reanimated";
import { useAuthContext } from "../../../contexts/AuthContext";
import colors from "../../../colors";
import Tab from "./Tab";

const DynamicTabs = React.memo(({ tabs, currentPage, onTabPress, theme }:
    { tabs: string[], currentPage: SharedValue<number>, onTabPress: (index: number) => void, theme: 'light' | 'dark' }) => {
    const activePageIndex = useDerivedValue(() => currentPage.value);

    return (
        <View style={{ zIndex: 100, marginTop: 'auto', height: 52, position: 'relative' }}>
            <View style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 }}>
                {tabs.map((label, index) => (
                    <Tab
                        key={index}
                        label={label}
                        index={index}
                        theme={theme}
                        activePageIndex={activePageIndex}
                        onTabPress={onTabPress}
                    />
                ))}
            </View>
        </View>
    );
});

export default DynamicTabs;