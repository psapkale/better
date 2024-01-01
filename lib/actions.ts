import { ProjectForm } from '@/common.types';
import {
   createProjectMutation,
   createUserMutation,
   deleteProjectMutation,
   getProjectByIdQuery,
   getProjectsOfUserQuery,
   getUserQuery,
   projectsQuery,
   updateProjectMutation,
} from '@/graphql';
import { GraphQLClient } from 'graphql-request';

const isProduction = process.env.NODE_ENV === 'production';
const apiUrl = process.env.NEXT_PUBLIC_GRAFBASE_API_URL || '';
// : 'http://127.0.0.1:4000/graphql';
const apiKey = isProduction
   ? process.env.NEXT_PUBLIC_GRAFBASE_API_KEY || ''
   : 'alksfdjaklsfdj';
const serverUrl = isProduction
   ? process.env.NEXT_PUBLIC_SERVER_URL
   : 'http://localhost:3000';

const client = new GraphQLClient(apiUrl);

const makeGraphQLRequest = (query: string, variables = {}) => {
   client
      .request(query, variables)
      .then((response) => {
         // @ts-ignore
         if (response.errors) {
            // @ts-ignore
            console.error('GraphQL Errors:', response.errors);
            throw new Error('GraphQL request returned errors');
         }

         return response;
      })
      .catch((error) => {
         console.error('GraphQL Request Error:', error);

         if (error.response?.status === 503) {
            console.error(
               'Server temporarily unavailable. Please try again later.'
            );
         }

         throw new Error('Failed to make GraphQL request');
      });
};

export const getUser = (email: string) => {
   client.setHeader('x-api-key', apiKey);
   return makeGraphQLRequest(getUserQuery, { email });
};

export const createUser = (name: string, email: string, avatarUrl: string) => {
   client.setHeader('x-api-key', apiKey);
   const variables = {
      input: {
         name: name,
         email: email,
         avatarUrl: avatarUrl,
      },
   };

   return makeGraphQLRequest(createUserMutation, variables);
};

const fetchToken = async () => {
   try {
      const response = await fetch(`${serverUrl}/api/auth/token`);

      if (!response.ok) {
         console.error('Fetch Token Error:', response.statusText);
         throw new Error('Failed to fetch token');
      }

      return response.json();
   } catch (error) {
      console.error('Fetch Token Error:', error);
      throw new Error('Failed to fetch token');
   }
};

export const uploadImage = async (imagePath: string) => {
   try {
      const response = await fetch(`${serverUrl}/api/upload`, {
         method: 'POST',
         body: JSON.stringify({ path: imagePath }),
      });

      return response.json();
   } catch (error) {
      throw error;
   }
};

export const createNewProject = async (
   form: ProjectForm,
   creatorId: string,
   token: string
) => {
   const imageUrl = await uploadImage(form.image);

   if (imageUrl.url) {
      client.setHeader('Authorization', `Bearer ${token}`);
      const variables = {
         input: {
            ...form,
            image: imageUrl.url,
            createdBy: {
               link: creatorId,
            },
         },
      };

      return makeGraphQLRequest(createProjectMutation, variables);
   }
};

export const fetchAllProjects = async (
   category?: string | null,
   endCursor?: string | null
) => {
   client.setHeader('x-api-key', apiKey);

   return makeGraphQLRequest(projectsQuery, { category, endCursor });
};

export const getProjectDetails = (id: string) => {
   client.setHeader('x-api-key', apiKey);

   return makeGraphQLRequest(getProjectByIdQuery, { id });
};

export const getUserProjects = (id: string, last?: number) => {
   client.setHeader('x-api-key', apiKey);

   return makeGraphQLRequest(getProjectsOfUserQuery, { id, last });
};

export const deleteProject = (id: string, token: string) => {
   client.setHeader('Authorization', `Bearer ${token}`);

   return makeGraphQLRequest(deleteProjectMutation, { id });
};

export const updateProject = async (
   form: ProjectForm,
   projectId: string,
   token: string
) => {
   // Checks if the project image is changed or not
   function isBase64DataUrl(value: string) {
      const base64Regex = /^data:image\/[a-z]+;base64,/;
      return base64Regex.test(value);
   }

   let updatedForm = { ...form };

   const isUploadingNewImage = isBase64DataUrl(form?.image);

   if (isUploadingNewImage) {
      const imageUrl = await uploadImage(form.image);

      if (imageUrl.url) {
         updatedForm = {
            ...updatedForm,
            image: imageUrl.url,
         };
      }
   }

   client.setHeader('Authorization', `Bearer ${token}`);

   const variables = {
      id: projectId,
      input: updatedForm,
   };

   return makeGraphQLRequest(updateProjectMutation, variables);
};
