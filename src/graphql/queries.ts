/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getAnnouncement = /* GraphQL */ `query GetAnnouncement($id: ID!, $schoolAndBoard: String!) {
  getAnnouncement(id: $id, schoolAndBoard: $schoolAndBoard) {
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
` as GeneratedQuery<
  APITypes.GetAnnouncementQueryVariables,
  APITypes.GetAnnouncementQuery
>;
export const listAnnouncements = /* GraphQL */ `query ListAnnouncements(
  $id: ID
  $schoolAndBoard: ModelStringKeyConditionInput
  $filter: ModelAnnouncementFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listAnnouncements(
    id: $id
    schoolAndBoard: $schoolAndBoard
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAnnouncementsQueryVariables,
  APITypes.ListAnnouncementsQuery
>;
export const getResource = /* GraphQL */ `query GetResource($id: ID!, $schoolAndBoard: String!) {
  getResource(id: $id, schoolAndBoard: $schoolAndBoard) {
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
` as GeneratedQuery<
  APITypes.GetResourceQueryVariables,
  APITypes.GetResourceQuery
>;
export const listResources = /* GraphQL */ `query ListResources(
  $id: ID
  $schoolAndBoard: ModelStringKeyConditionInput
  $filter: ModelResourceFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listResources(
    id: $id
    schoolAndBoard: $schoolAndBoard
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListResourcesQueryVariables,
  APITypes.ListResourcesQuery
>;
export const announcementsBySchoolAndBoard = /* GraphQL */ `query AnnouncementsBySchoolAndBoard(
  $schoolAndBoard: String!
  $sortDirection: ModelSortDirection
  $filter: ModelAnnouncementFilterInput
  $limit: Int
  $nextToken: String
) {
  announcementsBySchoolAndBoard(
    schoolAndBoard: $schoolAndBoard
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.AnnouncementsBySchoolAndBoardQueryVariables,
  APITypes.AnnouncementsBySchoolAndBoardQuery
>;
export const resourcesBySchoolAndBoard = /* GraphQL */ `query ResourcesBySchoolAndBoard(
  $schoolAndBoard: String!
  $sortDirection: ModelSortDirection
  $filter: ModelResourceFilterInput
  $limit: Int
  $nextToken: String
) {
  resourcesBySchoolAndBoard(
    schoolAndBoard: $schoolAndBoard
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ResourcesBySchoolAndBoardQueryVariables,
  APITypes.ResourcesBySchoolAndBoardQuery
>;
