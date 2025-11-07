/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createAnnouncement = /* GraphQL */ `mutation CreateAnnouncement(
  $input: CreateAnnouncementInput!
  $condition: ModelAnnouncementConditionInput
) {
  createAnnouncement(input: $input, condition: $condition) {
    id
    schoolAndBoard
    title
    body
    path
    aspectRatio
    startDate
    endDate
    archiveDate
    attachments {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    deleted
    skip
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateAnnouncementMutationVariables,
  APITypes.CreateAnnouncementMutation
>;
export const updateAnnouncement = /* GraphQL */ `mutation UpdateAnnouncement(
  $input: UpdateAnnouncementInput!
  $condition: ModelAnnouncementConditionInput
) {
  updateAnnouncement(input: $input, condition: $condition) {
    id
    schoolAndBoard
    title
    body
    path
    aspectRatio
    startDate
    endDate
    archiveDate
    attachments {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    deleted
    skip
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateAnnouncementMutationVariables,
  APITypes.UpdateAnnouncementMutation
>;
export const deleteAnnouncement = /* GraphQL */ `mutation DeleteAnnouncement(
  $input: DeleteAnnouncementInput!
  $condition: ModelAnnouncementConditionInput
) {
  deleteAnnouncement(input: $input, condition: $condition) {
    id
    schoolAndBoard
    title
    body
    path
    aspectRatio
    startDate
    endDate
    archiveDate
    attachments {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    deleted
    skip
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteAnnouncementMutationVariables,
  APITypes.DeleteAnnouncementMutation
>;
export const createResource = /* GraphQL */ `mutation CreateResource(
  $input: CreateResourceInput!
  $condition: ModelResourceConditionInput
) {
  createResource(input: $input, condition: $condition) {
    id
    schoolAndBoard
    content {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateResourceMutationVariables,
  APITypes.CreateResourceMutation
>;
export const updateResource = /* GraphQL */ `mutation UpdateResource(
  $input: UpdateResourceInput!
  $condition: ModelResourceConditionInput
) {
  updateResource(input: $input, condition: $condition) {
    id
    schoolAndBoard
    content {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateResourceMutationVariables,
  APITypes.UpdateResourceMutation
>;
export const deleteResource = /* GraphQL */ `mutation DeleteResource(
  $input: DeleteResourceInput!
  $condition: ModelResourceConditionInput
) {
  deleteResource(input: $input, condition: $condition) {
    id
    schoolAndBoard
    content {
      name
      address
      type
      size
      __typename
    }
    authorName
    authorId
    authorPicture
    authorRole
    editType
    editorId
    editTime
    editorname
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteResourceMutationVariables,
  APITypes.DeleteResourceMutation
>;
