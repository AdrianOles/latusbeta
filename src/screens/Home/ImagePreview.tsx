import React from "react";
import { View, Text, TouchableOpacity, Dimensions, Image, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../../colors";
import { useAuthContext } from "../../contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { HomeStackParamList } from "../../navigation";
import ImageZoom from 'react-native-image-pan-zoom';

type ImagePreviewRouteProp = RouteProp<HomeStackParamList, 'ImagePreview'>;

const ImagePreview = () => {
    const { theme } = useAuthContext();
    const navigation = useNavigation<HomeStackParamList>()
    const route = useRoute<ImagePreviewRouteProp>();
    const { image } = route.params;

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    return (
        <SafeAreaView edges={["top", "bottom"]} style={{ backgroundColor: colors.background[theme].elevated, height: '100%' }}>
            <View style={{
                backgroundColor: colors.background[theme].elevated, width: '100%', borderBottomWidth: 1, paddingTop: Platform.OS === 'android' ? 12: 0,
                borderColor: colors.fills[theme].stroke, paddingHorizontal: 8, paddingRight: 16, paddingBottom: 12, flexDirection: 'row',
                justifyContent: 'space-between', alignItems: 'center'
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 60, paddingVertical: 4 }}>
                    <Ionicons name="chevron-back-outline" size={24} color={colors.text[theme].primary} />
                </TouchableOpacity>

                <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 17, color: colors.text[theme].primary, textAlign: 'center' }}>
                    Image Preview
                </Text>

                <TouchableOpacity disabled={true} style={{ width: 60, alignItems: 'flex-end', opacity: 0 }}>
                    <View style={{
                        borderRadius: 250, backgroundColor: colors.fills[theme].standard, flexShrink: 1, flexGrow: 0,
                        width: 36, aspectRatio: 1, justifyContent: 'center'
                    }}>
                        <Ionicons name="download-outline" color={colors.text[theme].primary} size={20} style={{ alignSelf: 'center' }} />
                    </View>
                </TouchableOpacity>
            </View>

            <ImageZoom
                style={{backgroundColor: colors.background[theme].general}}
                cropWidth={windowWidth}
                cropHeight={windowHeight} // Adjust height to account for header
                imageWidth={windowWidth}
                imageHeight={windowHeight}
                useNativeDriver={true}
            >
                <Image
                    style={{ width: '100%', height: '100%', resizeMode: 'contain', top: -48 }}
                    source={{ uri: image }}
                />
            </ImageZoom>
        </SafeAreaView>
    )
}

export default React.memo(ImagePreview);