import puter from "@heyputer/puter.js";
import {getOrCreateHostingConfig, uploadImageToHosting} from "./puter.hosting";
import {isHostedUrl} from "./utils";

const PROJECT_PREFIX = "roomify_project_";

export const signIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<DesignItem | null> => {
    const currentUser = await getCurrentUser();

    if(!currentUser) {
        console.warn('Sign in with Puter before saving a project.');
        return null;
    }
    const projectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, label: 'source', }) : null;

    const hostedRender = projectId && item.renderedImage ?
        await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: 'rendered', }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage)
        ? item.sourceImage
        : ''
    );

    if(!resolvedSource) {
        console.warn('Failed to host source image, skipping save.')
        return null;
    }

    const resolvedRender = hostedRender?.url
        ? hostedRender?.url
        : item.renderedImage && isHostedUrl(item.renderedImage)
            ? item.renderedImage
            : undefined;

    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender,
        ownerId: rest.ownerId || currentUser.uuid,
        isPublic: visibility === "public",
    }

    try {
        await puter.kv.set(`${PROJECT_PREFIX}${item.id}`, payload);

        return payload;
    } catch (e) {
        console.error('Failed to save project', e)
        return null;
    }
}

export const getProjects = async (): Promise<DesignItem[]> => {
    try {
        const projects = await puter.kv.list<DesignItem>(PROJECT_PREFIX, true);

        return projects
            .map(({ value }) => value)
            .sort((first, second) => second.timestamp - first.timestamp);
    } catch (e) {
        console.error('Failed to get projects', e);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }): Promise<DesignItem | null> => {
    try {
        const project = await puter.kv.get<DesignItem>(`${PROJECT_PREFIX}${id}`);

        return project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};
