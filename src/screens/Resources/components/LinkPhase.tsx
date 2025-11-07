import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Linking, ActivityIndicator, Pressable, Keyboard, Image } from "react-native";
import colors from "../../../colors";
import { Ionicons } from '@expo/vector-icons';

interface Props {
    theme: 'light' | 'dark';
    onChangeLink: (link: string) => void;
    valueLink: string;
    onChangeTitle: (title: string) => void;
    valueTitle: string;
    error: number;
    onValid: (validLink: string) => void;
    placeHolder: string;
}

const checkLink = async (link: string): Promise<string | boolean> => {
    let checkThis = link;
    if (!link.startsWith('https://')) {
        checkThis = `https://${link}`;
    }
    try {
        const canOpen = await Linking.canOpenURL(checkThis);
        if (!canOpen) return false
    } catch (e) {
        console.log(e)
    }

    try {
        const response = await fetch(checkThis, { method: 'HEAD' });
        if (response.ok) {
            // Check for potential redirects or unwanted content types
            const contentType = response.headers.get('Content-Type');
            const location = response.headers.get('Location');

            if (location) {
                return false
            } else if (contentType && contentType.includes('text/html')) {
                return checkThis;
            } else {
                return false
            }
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

const LinkPhase: React.FC<Props> = React.memo(({ theme, onChangeLink, valueLink, onChangeTitle, valueTitle, error, onValid, placeHolder }) => {
    const [titleError, setTitleError] = useState<boolean>(false);
    const [linkError, setLinkError] = useState<boolean>(false);
    const [invalid, setInvalid] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [validLink, setValidLink] = useState<string>("");

    useEffect(() => {
        if (error === 1) { setLinkError(false); setLinkError(true); setInvalid(false) }
        if (error === 2) { setTitleError(true); setLinkError(false); setInvalid(false) }
        if (error === 3) { setTitleError(false); setLinkError(false); setInvalid(true) }
    }, [error])

    const validate = async () => {
        setLoading(true);
        const response = await checkLink(valueLink)
        if (response) {
            setInvalid(false);
            if (!valueLink.startsWith('https://')) {
                const temp = `https://${valueLink}`;
                setValidLink(temp);
            }
            setValidLink(valueLink);
            onValid(valueLink);
        } else {
            setInvalid(true);
        }
        setLoading(false);
    }

    return (
        <View style={{ paddingHorizontal: 16 }}>
            <TextInput
                placeholder={placeHolder}
                keyboardType="default"
                inputMode="text"
                onChangeText={onChangeTitle}
                value={valueTitle}
                editable={true}
                maxLength={48}
                placeholderTextColor={colors.text[theme].secondary}
                style={{
                    padding: 16, borderRadius: 16, borderWidth: 1, color: colors.text[theme].primary,
                    fontSize: 17, fontFamily: 'Figtree-SemiBold', letterSpacing: 0.2, lineHeight: 22,
                    borderColor: titleError && !valueTitle ? colors.system[theme].red : colors.fills[theme].stroke,
                    opacity: 1, minHeight: 56, marginBottom: 8
                }}
            />
            <View style={{ display: 'flex', position: 'relative' }}>
                <Ionicons name="link" size={18} style={{ paddingHorizontal: 16, color: colors.text[theme].secondary, position: 'absolute', top: '50%', transform: [{ translateY: -9 }, { "rotate": "135deg" }] }} />
                {validLink && validLink === valueLink && (
                    <Image
                        source={{ uri: `https://www.google.com/s2/favicons?domain=${validLink}&sz=64` }}
                        height={22}
                        width={22}
                        style={{ left: 14, top: 18, width: 22, height: 22, objectFit: 'contain', position: 'absolute' }}
                    />
                )}
                <View style={{position: 'relative'}}>
                    <TextInput
                        placeholder="Paste URL"
                        keyboardType="url"
                        autoCorrect={false}
                        inputMode="url"
                        onChangeText={onChangeLink}
                        value={valueLink}
                        editable={true}
                        placeholderTextColor={colors.text[theme].secondary}
                        style={{
                            padding: 16, paddingLeft: 40, borderRadius: 16, borderWidth: 1, color: (validLink === valueLink) && valueLink.length > 0 ? colors.system[theme].blue : colors.text[theme].primary,
                            fontSize: 17, fontFamily: 'Figtree-Medium', letterSpacing: 0.2, lineHeight: 22,
                            borderColor: (linkError && !valueLink) || invalid ? colors.system[theme].red : colors.fills[theme].stroke,
                            opacity: 1, minHeight: 56
                        }}
                    />
                </View>
            </View>
            {invalid && (
                <Text style={{marginTop: 8, fontFamily: "Figtree-Medium", fontSize: 13, lineHeight: 18, color: colors.system[theme].red, letterSpacing: 0.2}}>
                    Something is stopping us from verifying. Are you sure you want to add this link?
                </Text>
            )}
            {(!(validLink === valueLink) && valueLink.length > 0) && (
                <Pressable onPress={() => Keyboard.dismiss()} style={{ justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                    <TouchableOpacity onPress={validate} style={{
                        backgroundColor: colors.fills[theme].standard, paddingVertical: 16, width: 256, borderRadius: 250,
                        marginBottom: 8, opacity: loading ? 0.5 : 1
                    }}>
                        {loading ? (<ActivityIndicator></ActivityIndicator>) : (
                            <Text style={{
                                textAlign: 'center', color: colors.system[theme].blue,
                                fontFamily: 'Figtree-SemiBold', fontSize: 15, lineHeight: 20
                            }}>
                                Check link
                            </Text>
                        )}
                    </TouchableOpacity>
                    <Text style={{ fontSize: 13, fontFamily: 'Figtree-Medium', letterSpacing: 0.2, color: colors.text[theme].secondary }}>Verify your link to be sure</Text>
                </Pressable>
            )}
        </View>
    )
})

export default React.memo(LinkPhase);