// import { create } from "zustand";
// import { Area } from "react-easy-crop";
// import { v4 as uuidv4 } from "uuid";
// import { Asset } from "../posts/types";

// export interface EditSettings {
//   tint: string;
//   tintAmount: number;
//   compression: number;
//   noise: number;
//   flipHorizontal: boolean;
//   opacity: number;
//   hue: number;
//   rotation: number;
//   brightness: number;
//   contrast: number;
//   temperature: number;
//   vignette: number;
//   crop: Area | null;
//   zoom: number;
//   cropCoordinates: { x: number; y: number };
// }

// export const defaultSettings: EditSettings = {
//   tint: "#ffffff",
//   tintAmount: 0,
//   compression: 0.92,
//   noise: 0,
//   flipHorizontal: false,
//   opacity: 1,
//   hue: 0,
//   rotation: 0,
//   brightness: 1,
//   contrast: 1,
//   temperature: 0,
//   vignette: 0,
//   crop: null,
//   zoom: 1,
//   cropCoordinates: { x: 0, y: 0 },
// };

// type ImageEditorState = {
//   isOpen: boolean;
//   assets: Asset[];
//   editSettings: Record<string, EditSettings>;
//   openEditor: (assets: Asset[]) => void;
//   closeEditor: () => void;
//   setEditSettings: (assetId: string, updater: (prev: EditSettings) => EditSettings) => void;
//   addAssets: (files: File[], postId: number) => void;
//   removeAsset: (assetId: string) => void;
// };

// export const useImageEditorStore = create<ImageEditorState>((set) => ({
//   isOpen: false,
//   assets: [],
//   editSettings: {},
//   openEditor: (assets) => {
//     const initialSettings: Record<string, EditSettings> = {};
//     assets.forEach((asset) => {
//       initialSettings[asset.id] = {
//         ...defaultSettings,
//         ...asset.editSettings,
//       };
//     });
//     set({
//       isOpen: true,
//       assets,
//       editSettings: initialSettings,
//     });
//   },
//   closeEditor: () => set({ isOpen: false, assets: [], editSettings: {} }),
//   setEditSettings: (assetId, updater) =>
//     set((state) => ({
//       editSettings: {
//         ...state.editSettings,
//         [assetId]: updater(state.editSettings[assetId] || defaultSettings),
//       },
//     })),
//   addAssets: (files, postId) =>
//     set((state) => {
//       const newAssets: Asset[] = files.map((file) => ({
//         id: uuidv4(),
//         post_id: postId.toString(),
//         asset_url: URL.createObjectURL(file),
//         asset_type: "slides",
//         order: state.assets.length + 1,
//         created_at: new Date().toISOString(),
//         status: "new",
//         file,
//         originalFile: file,
//       }));
//       const newEditSettings: Record<string, EditSettings> = {};
//       newAssets.forEach((asset) => {
//         newEditSettings[asset.id] = defaultSettings;
//       });
//       return {
//         assets: [...state.assets, ...newAssets],
//         editSettings: { ...state.editSettings, ...newEditSettings },
//       };
//     }),
//   removeAsset: (assetId) =>
//     set((state) => {
//       const newAssets = state.assets.filter((asset) => asset.id !== assetId);
//       const newEditSettings = { ...state.editSettings };
//       delete newEditSettings[assetId];
//       return {
//         assets: newAssets,
//         editSettings: newEditSettings,
//       };
//     }),
// }));
