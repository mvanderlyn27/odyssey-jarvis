// import { Label } from "@/components/ui/label";
// import { Slider } from "@/components/ui/slider";
// import { Button } from "@/components/ui/button";
// import { EditSettings } from "./useImageEditorStore";

// interface ImageEditingPanelProps {
//   editSettings: EditSettings;
//   setCurrentEditSettings: (updater: (prev: EditSettings) => EditSettings) => void;
// }

// export const ImageEditingPanel = ({ editSettings, setCurrentEditSettings }: ImageEditingPanelProps) => {
//   return (
//     <div className="w-1/3 space-y-4 overflow-y-auto p-4">
//       <h3 className="text-lg font-semibold">Edit Image</h3>
//       <div className="space-y-2">
//         <Label>Zoom: {editSettings.zoom.toFixed(2)}</Label>
//         <Slider
//           value={[editSettings.zoom]}
//           onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, zoom: value }))}
//           min={1}
//           max={3}
//           step={0.01}
//         />
//       </div>
//       <div className="space-y-2">
//         <Label>Rotation: {editSettings.rotation.toFixed(1)}°</Label>
//         <Slider
//           value={[editSettings.rotation]}
//           onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, rotation: value }))}
//           min={-5}
//           max={5}
//           step={0.1}
//         />
//       </div>
//       <div className="space-y-2">
//         <Label>Brightness: {editSettings.brightness.toFixed(2)}</Label>
//         <Slider
//           value={[editSettings.brightness]}
//           onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, brightness: value }))}
//           min={0.5}
//           max={1.5}
//           step={0.01}
//         />
//       </div>
//       <div className="space-y-2">
//         <Label>Contrast: {editSettings.contrast.toFixed(2)}</Label>
//         <Slider
//           value={[editSettings.contrast]}
//           onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, contrast: value }))}
//           min={0.5}
//           max={1.5}
//           step={0.01}
//         />
//       </div>
//       <div className="space-y-2">
//         <Label>Opacity: {editSettings.opacity.toFixed(2)}</Label>
//         <Slider
//           value={[editSettings.opacity]}
//           onValueChange={([value]) => setCurrentEditSettings((s) => ({ ...s, opacity: value }))}
//           min={0}
//           max={1}
//           step={0.01}
//         />
//       </div>
//       <div className="flex items-center gap-2 pt-2">
//         <Label htmlFor="flip" className="flex-1">
//           Flip Horizontal
//         </Label>
//         <Button
//           onClick={() => setCurrentEditSettings((s) => ({ ...s, flipHorizontal: !s.flipHorizontal }))}
//           variant={editSettings.flipHorizontal ? "secondary" : "outline"}>
//           {editSettings.flipHorizontal ? "On" : "Off"}
//         </Button>
//       </div>
//     </div>
//   );
// };
