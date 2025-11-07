import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Dimensions, FlatList, Linking, Modal, Platform, Pressable, RefreshControl, Text, TouchableOpacity, View, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateClient, GraphQLQuery } from 'aws-amplify/api';
import useSWR, { mutate, SWRResponse } from 'swr';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import { AttachInput, DeleteResourceMutation, Resource, ResourcesBySchoolAndBoardQuery } from '../../API';
import colors from '../../colors';
import SkeletonLoader from '../../components/SkeletonLoader';
import { HomeStackParamList } from '../../navigation';
import ModalButton from '../../components/ModalButton';
import { StatusBar } from 'expo-status-bar';
import Card from './components/Card';

type IconName = "wallet" | "leaf" | "paper-plane" | "accessibility" | "paper-plane" | "library";
const windowWidth = Dimensions.get('window').width;

type resource = {
    item: AttachInput;
    id: string;
}

const client = generateClient();

const Resources = () => {
    const { authUser, updateAFilter, theme } = useAuthContext();
    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation<HomeStackParamList>();
    const [optionModal, setOptionModal] = useState(false);
    const [focusedId, setFocusId] = useState<string | null>(null);
    const [waiting, setWaiting] = useState<null | 'edit' | 'delete'>(null);
    const [creationLoading, setCreationLoading] = useState<boolean>(false);

    //(Fetch) Query and API call to amplify and AppSync
    //!Update fetch to first check in cache
    const fetchResources = async () => {
        console.log("fetching resources")
        setLoading(true);

        try {
            console.log("Auth user before fetch: ", authUser);
            const result = await client.graphql<GraphQLQuery<ResourcesBySchoolAndBoardQuery>>({
                query: queries.resourcesBySchoolAndBoard,
                variables: {
                    schoolAndBoard: authUser?.school.toUpperCase() + "+" + "HCDSB",
                }
            })

            setLoading(false);
            if (result?.data?.resourcesBySchoolAndBoard?.items) {
                return result.data.resourcesBySchoolAndBoard.items;
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        } finally {
            
        }
    }

    //Triggers fetch using SWR
    const { data, error, isLoading }: SWRResponse = useSWR('resources', fetchResources, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 600000, // 1 minute (or set to your desired interval)
    });

    //Triggers refetch with SWR
    const refetchResources = async () => {
        mutate('resources')
    }

    const RHeader = () => {
        return (
            <View style={{
                display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                paddingVertical: authUser?.staffRole === 'TEACHER' ? 12 : 0, height: authUser?.staffRole === 'STUDENT' ? 76 : 'auto', marginBottom: 16
            }}>
                <View style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text style={{ fontSize: 24, lineHeight: 29, color: colors.text[theme].primary, fontFamily: 'Figtree-Bold' }}>Resources</Text>
                    <Text style={{ color: colors.text[theme].secondary, fontFamily: 'Figtree-Semibold', fontSize: 16, lineHeight: 21 }}>{data?.length > 0 && data ? data.length : 0} total</Text>
                </View>
                {
                    authUser?.staffRole === 'ADMIN' && (
                        <TouchableOpacity onPress={() => navigation.navigate("Menu", { })} style={{ paddingHorizontal: 16, paddingRight: 0, paddingVertical: 16 }}>
                            <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 36, aspectRatio: 1, backgroundColor: colors.text[theme].primary, borderRadius: 250 }}>
                                <Ionicons name={'add'} size={24} color={colors.background[theme].general}></Ionicons>
                            </View>
                        </TouchableOpacity>
                    )
                }
            </View>
        )
    }

    //(Deletion) Query and API call to amplify and AppSync
    const onDelete = async (id: string) => {
        if (id && authUser) {

            const { data: deletedResource, errors } = await client.graphql<GraphQLQuery<DeleteResourceMutation>>({
                query: mutations.deleteResource,
                variables: {
                    input: {
                        id: id,
                        schoolAndBoard: authUser.school.toUpperCase() + '+' + "HCDSB"
                    }
                }
            })

            if (errors) {
                Toast.show({
                    type: 'error',
                    topOffset: 0
                })
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            } else {
                Toast.show({
                    type: 'delete',
                    topOffset: 0
                })
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            }
        }
    }

    //Deletion process logic for loading/async promise/optimistic UI
    const deleteResource = async (id: string) => {
        if ((waiting === null)) {
            setWaiting('delete')
            setCreationLoading(true);

            const updatedResources = data.filter((resource: Resource) => resource.id !== focusedId);
            const options = {
                optimisticData: updatedResources,
                rollbackOnError(error: any) {
                    // If it's timeout abort error, don't rollback
                    return error.name !== 'AbortError'
                },
            }

            mutate('resources',() => onDelete(id), options);

            setTimeout(() => {
                setWaiting(null);
                setCreationLoading(false);
                setOptionModal(false);
            }, 400)
        }
    }

    //Open modal with correct resource information in parameters
    const editResource = () => {
        const resource = data.find((resource: Resource) => resource.id === focusedId);

        if (resource) {
            setOptionModal(false);
            navigation.navigate("RCreateScreen", {
                id: resource.id,
                defaultTitle: resource.title,
                defaultIcon: resource.icon,
                defaultIconColor: resource.color,
                defaultLink: resource.link
            })
        }
    }

    //Skeleton for loading resources
    //TODO: Move to separate file
    const SkeletonCard = () => {
        return (
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <View style={{
                    backgroundColor: '#FFFFFF14', height: 72, width: '100%', borderRadius: 250, position: 'relative',
                    display: 'flex', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 16,
                }}>
                    <SkeletonLoader height={32} borderRadius={6} width={32} />
                    <SkeletonLoader height={22} borderRadius={6} width={150} />
                </View>
            </View>
        )
    }

    return (
        <View style={{backgroundColor: colors.background[theme].general, height: '100%'}}>
            {
                Platform.OS === 'ios' && (<View style={{ height: 50, width: '100%' }} />)
            }
            <StatusBar translucent={true} style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={'transparent'} />
            <FlatList
                contentInsetAdjustmentBehavior="automatic"
                data={data}
                renderItem={({ item, index }) => (
                    <>
                        {
                            data && data?.length > 0 ? (
                                <Card resource={true} onDelete={(id) => deleteResource(id)} key={index} id={item.id} item={item.content} theme={theme} creating={false} />
                            ) : (
                                <>
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </>
                            )
                        }
                    </>
                )}
                ListHeaderComponent={<RHeader />}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                contentContainerStyle={{paddingHorizontal: 16}}
                refreshing={loading}
                style={{backgroundColor: colors.background[theme].general}}
                onRefresh={() => refetchResources()}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => refetchResources()}
                        colors={[colors.text[theme].primary]}
                        progressBackgroundColor={colors.text[theme].primary} // Customize the background color of the indicator
                        tintColor={colors.text[theme].primary}
                    />
                }
            />

            {/* Message for content */}
            {
                (data?.length === 0 || !data || data === undefined) && (
                    <View style={{
                        position: 'absolute', top: '40%', right: 0, left: 0, transform: [{ translateX: windowWidth % 2 }, { translateY: windowWidth % 2 }],
                        zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    }}>
                        <Ionicons name='grid' color={colors.text[theme].secondary} size={60} />
                        <Text style={{ color: colors.text[theme].secondary, textAlign: 'center', width: 'auto', marginHorizontal: 'auto', lineHeight: 26, fontSize: 18, fontFamily: 'Figtree-Bold', marginTop: 12 }}>
                            No resources
                        </Text>
                        <Text style={{ color: colors.text[theme].tertiary, fontFamily: "Figtree-SemiBold", fontSize: 15, lineHeight: 20 }}>
                            Nothing to see here
                        </Text>
                    </View>
                )
            }

            {/* Edit/Delete Option Modal */}
            <Modal
                visible={optionModal}
                transparent={true}
                animationType='fade'
                presentationStyle='overFullScreen'
            >
                <Pressable onPress={() => { if (waiting === null) { setOptionModal(false) } }} style={{
                    width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backgroundColor: '#000000A9', paddingHorizontal: 32, position: 'relative'
                }}>
                    <Pressable style={{
                        display: 'flex', flexDirection: 'column', gap: 16, backgroundColor: colors.background[theme].elevated, padding: 16, borderRadius: 16,
                        width: '100%', position: 'absolute', zIndex: 10
                    }}>
                        <Text style={{ color: colors.text[theme].primary, fontFamily: 'Figtree-SemiBold', fontSize: 17, lineHeight: 22, textAlign: 'center' }}>What would you like to do?</Text>
                        <View style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <ModalButton
                                state="second"
                                disabled={(waiting != null) || waiting === "edit"}
                                onPress={editResource}
                                label='Edit'
                                loadingIndicator={false}
                                announcement={true}
                            />
                            <ModalButton
                                state="second"
                                disabled={(waiting != null) || waiting === "delete"}
                                onPress={() => {}}
                                label='Delete'
                                loadingIndicator={true}
                                newColor={colors.system[theme].red}
                                announcement={true}
                            />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    )
}

export default Resources