import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, Image, Alert, ActivityIndicator } from "react-native";
import { Attach, AttachInput, DeleteResourceMutation, Resource } from "../../../API";
import { Ionicons } from '@expo/vector-icons';
import colors from "../../../colors";
import { downloadData, getUrl } from "aws-amplify/storage";
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useAuthContext } from "../../../contexts/AuthContext";
import { mutate } from "swr";
import { generateClient, GraphQLQuery } from "aws-amplify/api";

interface Props {
    item: AttachInput;
    id: string;
    resource: boolean;
    theme: 'light' | 'dark'
    onDelete: (id: string) => void;
    creating: boolean;
}

type FileType = "pdf" | "basic" | "word" | "ppt" | "url" | 'image' | 'xml';

const handleDownloadAndShareFile = async (s3Path: string) => {
    try {
        const getUrlResult = await getUrl({
            path: s3Path,
            options: {
                expiresIn: 600, // 10 minutes
            },
        });
        const fileUrl = getUrlResult.url.toString();

        // 2. Open the URL directly using the Linking API
        const canOpen = await Linking.canOpenURL(fileUrl);
        if (canOpen) {
            await Linking.openURL(fileUrl);
        } else {
            // Handle cases where the URL can't be opened
            Alert.alert('Error', 'Cannot open the file. The URL is invalid or the device has no associated app.');
        }

    } catch (error) {
        console.error('Error during URL generation or opening:', error);
        Alert.alert('Download Failed', 'Could not prepare the file for download. Please try again.');
    }
};

const cardColors: Record<"dark" | "light", Record<FileType, {
    color: string; iconColor: string,
    icon?: 'document-text-outline' | "image-outline" | "text-outline"
}>> = {
    "dark": {
        "pdf": {
            color: '#403636',
            iconColor: '#FFBFBF',
            icon: 'document-text-outline'
        },
        "image": {
            color: 'transparent',
            iconColor: '#FFFFFF',
            icon: 'image-outline'
        },
        "basic": {
            color: '#474B59',
            iconColor: '#BFC5FF',
            icon: "text-outline"
        },
        "word": {
            color: '#214B8A',
            iconColor: '#FFBFBF',
        },
        "xml": {
            color: '#1C573B',
            iconColor: '#FFBFBF',
        },
        "ppt": {
            color: '#82311D',
            iconColor: '#FFBFBF',
        },
        "url": {
            color: 'transparent',
            iconColor: "#4785FF",
        }
    },
    "light": {
        "pdf": {
            color: '#F5EBEB',
            iconColor: '#990606',
            icon: 'document-text-outline'
        },
        "image": {
            color: 'transparent',
            iconColor: '#000000',
            icon: 'image-outline'
        },
        "basic": {
            color: '#E6E8F0',
            iconColor: '#061299',
            icon: "text-outline"
        },
        "word": {
            color: '#B4D0FA',
            iconColor: '#FFBFBF'
        },
        "xml": {
            color: '#B2EBD0',
            iconColor: '#FFBFBF',
        },
        "ppt": {
            color: '#FAAF9C',
            iconColor: '#FFBFBF'
        },
        "url": {
            color: 'transparent',
            iconColor: '#2366EB'
        }
    }
}

const Card: React.FC<Props> = React.memo(({ item, id, theme, onDelete, creating, resource }) => {
    const { authUser } = useAuthContext();
    const [loading, setLoading] = useState<boolean>(false);

    const handlePress = async () => {
        if (item.type === 'url') {
            let checkThis = item.address;
            if (!checkThis.startsWith('https://')) {
                checkThis = `https://${item.address}`;
            }
            Linking.openURL(checkThis.toLowerCase())
        } else {
            setLoading(true);
            if (!creating) {
                console.log("hello")
                handleDownloadAndShareFile(item.address)
            }
            setLoading(false);
        }
    }

    const processingStyle = (): FileType => {
        if (item.type) {
            if (item.type.includes("presentation") || item.type.includes("powerpoint")) {
                return "ppt";
            } else if (item.type.includes("pdf")) {
                return "pdf"
            } else if (item.type.toLowerCase().includes("jpeg") ||
                item.type.toLowerCase().includes("png") ||
                item.type.toLowerCase().includes("webp") || item.type.toLowerCase().includes("image")) {
                return 'image'
            } else if (item.type.toLowerCase().includes("sheet") || item.type.toLowerCase().includes("excel")) {
                return "xml"
            } else if (item.type.toLowerCase().includes("word")) {
                return "word"
            } else if (item.type === 'url') {
                return 'url'
            } else {
                return "basic"
            }
        }

        return "basic"
    }

    const pictureIcon = () => {
        if (processingStyle() === 'word') return require("../../../../assets/logos/word.png")
        if (processingStyle() === 'ppt') return require("../../../../assets/logos/ppt.png")
        if (processingStyle() === 'xml') return require("../../../../assets/logos/excel.png")
    }
    
    const subLabel = () => {
        if (item.type === 'url') return item.address.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0].toLowerCase()
        else {
            const temp = item.type.toUpperCase().split('/')[1];
            if (temp.length > 10) {
                if (temp.toLowerCase().includes("word")) return "Document";
                else if (temp.toLowerCase().includes("sheet") || temp.includes("excel")) return "Spreadsheet"
                else return "Presentation"
            } else {
                return temp
            }
        }
    }

    const iconPress = () => {
        console.log("iconPress")
        if ((authUser?.staffRole === "ADMIN") || creating) {
            Alert.alert('Are you sure you want to delete?', '', [
                {
                    text: 'Delete',
                    onPress: () => {
                        if (!creating) {
                            setLoading(true);
                        }
                        onDelete(id);
                    },
                    style: 'destructive',
                },
                { text: 'Cancel', style: 'cancel', onPress: () => {} },
            ])
        } else {
            handlePress()
        }
    }

    return (
        <View style={{
            flexDirection: 'row',
            backgroundColor: cardColors[theme][processingStyle()].color,
            borderColor: colors.fills[theme].stroke,
            borderWidth: 2,
            alignItems: 'center',
            borderRadius: resource ? 250 : 24,
            alignSelf: 'flex-start', // ⬅️ Add this line
            width: resource ? '100%' : 'auto',
            flexShrink: 1, zIndex: 2
        }}>
            <TouchableOpacity style={{
                display: 'flex', flexDirection: 'row', padding: resource ? 16 : 12, paddingRight: 16, alignItems: 'center', flexGrow: resource ? 1 : 0
            }}
                onPress={handlePress}>
                <View style={{ display: 'flex', flexDirection: 'row',}}>
                    <View style={{ width: 35, aspectRatio: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                        <Ionicons
                            style={{ position: 'absolute' }}
                            size={28}
                            name={item.type === 'url' ? 'globe-outline' : cardColors[theme][processingStyle()].icon}
                            color={cardColors[theme][processingStyle()].iconColor}
                        />
                        {processingStyle() === 'word' || processingStyle() === 'ppt' || processingStyle() === 'xml' ? (
                            <Image
                                source={pictureIcon()}
                                style={{ objectFit: 'contain' }}
                                width={35}
                                height={35}
                            />
                        ) : (
                            <Ionicons
                                style={{ position: 'absolute' }}
                                size={28}
                                name={item.type === 'url' ? 'globe-outline' : cardColors[theme][processingStyle()].icon}
                                color={cardColors[theme][processingStyle()].iconColor}
                            /> 
                        )}
                        {item.type === 'url' && (<Image source={{ uri: `https://www.google.com/s2/favicons?domain=${item.address}&sz=64` }} style={{ width: '100%', height: '100%', borderRadius: 250, overflow: 'hidden' }} />)}
                    </View>
                    <View style={{ marginLeft: 8, flexShrink: 1, paddingRight: 44 }}>
                        <Text numberOfLines={1} style={{ fontFamily: "Figtree-SemiBold", fontSize: 16, lineHeight: 22, letterSpacing: 0.2, color: colors.text[theme].primary, flexShrink:  1 }}>{item.name}</Text>
                        <Text style={{ fontFamily: "Figtree-Medium", fontSize: 13, lineHeight: 14, letterSpacing: 0.2, color: colors.text[theme].secondary }}>
                            {subLabel()}
                            {item.type != 'url' && (
                                <>
                                    &nbsp;
                                    <Ionicons name="ellipse" color={colors.text[theme].secondary} size={6} />
                                    &nbsp;{item.size}
                                </>
                            )
                                }
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={iconPress} style={{ paddingRight: 14, position: 'absolute', right: 0, top: 20, alignSelf: 'center', zIndex: 10 }}>
                {loading && (
                    <ActivityIndicator style={{ marginRight: 8, top: (resource && !creating) ? 2 : 0 }} />
                )}
                {((((authUser?.staffRole === "ADMIN") && id) || creating) && !loading) ? (
                    <Ionicons name={'remove-circle-outline'} style={{ marginRight: 8, top: (resource && !creating) ? 2 : 0 }} size={24} color={colors.system[theme].red} />
                ) : !loading && (
                    <Ionicons name={item.type === 'url' ? "arrow-forward" : 'download-outline'} style={{ marginRight: 8, top: resource && !creating ? 2 : 0 }} size={24} color={colors.text[theme].secondary} />
                )}
            </TouchableOpacity>
        </View>
    )
})

export default React.memo(Card);