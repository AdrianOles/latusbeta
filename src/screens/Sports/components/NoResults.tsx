import React from "react";
import { View, Text } from "react-native";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from "react-native-svg";


const NoResults = ({theme, mainLabel, subLabel}: {theme: 'light' | 'dark', mainLabel: string, subLabel: string}) => {
    return (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingHorizontal: 40}}>
            <View style={{ transform: [{ scale: 0.8 }]}}>
                <Svg height={78} width={78}>
                    <Path d="M66.3779 0C72.5205 0.000331843 77.5 4.98036 77.5 11.123V47.7197C77.4999 53.8624 72.5205 58.8424 66.3779 58.8428H11.123C4.9802 58.8428 7.30663e-05 53.8626 0 47.7197V11.123C0 4.98016 4.98016 0 11.123 0H66.3779ZM11.123 5.02344C7.75437 5.02344 5.02344 7.75437 5.02344 11.123V17.2217H11.8408C14.0202 17.222 15.7869 18.9896 15.7871 21.1689V38.3906C15.7871 40.5702 14.0203 42.3376 11.8408 42.3379H5.02344V47.7197C5.02351 51.0883 7.75441 53.8193 11.123 53.8193H36.2383V42.8232C29.9085 41.6442 25.1155 36.0934 25.1152 29.4219C25.1152 22.7501 29.9082 17.1977 36.2383 16.0186V5.02344H11.123ZM41.2617 16.0186C47.5918 17.1975 52.3838 22.75 52.3838 29.4219C52.3835 36.0935 47.5916 41.6444 41.2617 42.8232V53.8193H66.3779C69.7463 53.819 72.4765 51.0881 72.4766 47.7197V42.3379H65.6602C63.4804 42.3379 61.7129 40.5704 61.7129 38.3906V21.1689C61.7131 18.9894 63.4806 17.2217 65.6602 17.2217H72.4766V11.123C72.4766 7.75457 69.7463 5.02377 66.3779 5.02344H41.2617V16.0186ZM36.2383 21.1826C32.7079 22.2577 30.1387 25.54 30.1387 29.4219C30.1389 33.3034 32.7083 36.5831 36.2383 37.6582V21.1826ZM41.2617 37.6582C44.7917 36.5832 47.3601 33.3035 47.3604 29.4219C47.3604 25.5399 44.7921 22.2576 41.2617 21.1826V37.6582ZM5.74121 37.3145H10.7646V22.2451H5.74121V37.3145ZM66.7363 37.3145H71.7598V22.2451H66.7363V37.3145Z"
                        fill={colors.text[theme].secondary}
                    />
                </Svg>
            </View>
            <Text style={{ fontFamily: 'Figtree-Bold', fontSize: 17, color: colors.text[theme].secondary }}>{mainLabel}</Text>
        </View>
    )
}

export default NoResults;