import { TouchableOpacity, View, Text, Pressable, Keyboard, Platform, Image, ActivityIndicator } from "react-native";
import ProfileGen from "../../../components/ProfileGen";
import { AuthUserCustomType } from "../../../contexts/AuthContext";
import { HomeStackParamList } from "../../../navigation";
import React, { createContext, useState } from "react";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { FileData } from "../AddFile";
import { LinkData } from "../AddLink";
import { DateType } from "../AddDate";

interface Props {
    theme: 'light' | 'dark';
    authUser: AuthUserCustomType;
    navigation: HomeStackParamList;
    imageChange: (image: string | null) => void;
    blobChange: (blob: Blob | null) => void;
    imageLoading: (state: boolean) => void;
    imageAdded: boolean;
    fileAdded: boolean;
    linkAdded: boolean;
    fileChange: (file: FileData | null) => void;
    linkChange: (link: LinkData | null) => void;
    dateChange: (date: DateType) => void;
    startDefault: Date;
    endDefault: Date;
    create: () => void;
    disabled: boolean;
}

export const FileContext = createContext({});
export const LinkContext = createContext({});

const CFooter: React.FC<Props> = ({
    theme, authUser, navigation, imageChange, blobChange, imageLoading, imageAdded, fileChange, fileAdded, linkChange,
    linkAdded, dateChange, startDefault, endDefault, create, disabled
}) => {
            
    const pickImage = async () => {
        //!Provide permission request on iOS
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
        });

        if (!result.canceled) {
            imageLoading(true);
            const { uri, width, height } = result.assets[0];

            // Step 1: Resize the image based on the platform (you can adjust the size as needed)
            const targetWidth = Platform.OS === 'web' ? 1200 : 800;
            const targetHeight = (targetWidth / width) * height;

            const resizedImage = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: targetWidth, height: targetHeight } }],
                { compress: 1, format: ImageManipulator.SaveFormat.WEBP } // No initial compression
            );

            const response = await fetch(resizedImage.uri);
            let blob = await response.blob();

            // Step 2: Check if the file size is within the acceptable range
            const maxFileSizeInBytes = 300 * 1024; // 300KB threshold
            console.log(blob.size)

            if (blob.size > maxFileSizeInBytes) {
                // Step 3: Compress the image if it exceeds the size threshold
                const compressedImage = await ImageManipulator.manipulateAsync(
                    resizedImage.uri,
                    [],
                    { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP } // Compress to 80% quality
                );

                const compressedResponse = await fetch(compressedImage.uri);
                blob = await compressedResponse.blob(); // Replace with the compressed blob

                imageChange(compressedImage.uri);
            } else {
                // No additional compression needed, use the resized image
                imageChange(resizedImage.uri);
            }

            blobChange(blob);
            imageLoading(false);
        } else {
            imageLoading(false);
        }
    };

    return (
        <View style={{ paddingBottom: 24 }}>
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colors.fills[theme].stroke, borderBottomWidth: 1 }}>
                <TouchableOpacity onPress={() => {if(!disabled) pickImage()}} disabled={imageAdded || disabled} style={{ opacity: imageAdded || disabled ? 0.2 : 1,
                    width: '33%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14,
                 }}>
                    <Ionicons size={20} name='image-outline' color={colors.text[theme].secondary} style={{marginRight: 4}} />
                    <Text style={{fontSize: 15, lineHeight: 20, fontFamily: "Figtree-Medium", color: colors.text[theme].secondary}}>
                        Image
                    </Text>
                </TouchableOpacity>
                <View style={{ width: 1, height: '60%', backgroundColor: colors.fills[theme].stroke, alignSelf: 'center' }} />
                <TouchableOpacity disabled={disabled} onPress={() => navigation.navigate("AddFile", { fileChange: fileChange })} style={{
                    width: '33%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14,
                    opacity: fileAdded || disabled ? 0.2 : 1
                }}>
                    <Ionicons size={20} name='document-text-outline' color={colors.text[theme].secondary} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 15, lineHeight: 20, fontFamily: "Figtree-Medium", color: colors.text[theme].secondary }}>
                        File
                    </Text>
                </TouchableOpacity>
                <View style={{ width: 1, height: '60%', backgroundColor: colors.fills[theme].stroke, alignSelf: 'center' }} />
                <TouchableOpacity disabled={disabled} onPress={() => navigation.navigate("AddLink", {linkChange : linkChange})} style={{
                    width: '33%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14,
                    opacity: linkAdded || disabled ? 0.2 : 1,
                }}>
                    <Ionicons size={20} name='globe-outline' color={colors.text[theme].secondary} style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 15, lineHeight: 20, fontFamily: "Figtree-Medium", color: colors.text[theme].secondary }}>
                        Link
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', padding: 16 }}>
                <TouchableOpacity disabled={disabled} onPress={() => navigation.navigate("AddDate", {dateChange: dateChange, startDefault, endDefault})} style={{
                    borderWidth: 1, borderColor: colors.fills[theme].stroke, borderRadius: 250, justifyContent: 'center',
                    flexGrow: 1, marginRight: 12, opacity: disabled ? 0.5 : 1
                }}>
                    <Text style={{textAlign: 'center', fontFamily: "Figtree-SemiBold", fontSize: 12, lineHeight: 14, color: colors.text[theme].tertiary}}>
                        Scheduled
                    </Text>
                    <Text style={{ fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20, color: colors.text[theme].primary, textAlign: 'center'}}>
                        {startDefault.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDefault.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={disabled} onPress={create} style={{
                    paddingHorizontal: 24, borderRadius: 250,
                    backgroundColor: colors.text[theme].primary, paddingVertical: 20,
                    opacity: disabled ? 0.5 : 1
                }}>
                    {disabled ? (
                        <ActivityIndicator style={{paddingHorizontal: 12}}></ActivityIndicator>
                    ) : (
                        <Text style={{ fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20, color: colors.background[theme].general, alignSelf: 'center' }}>
                            Create
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CFooter;