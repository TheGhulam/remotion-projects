import { Composition } from "remotion";
import { KVCache } from "./KVCache";
import { DiabetesFairness } from "./DiabetesFairness";
import {
  ASD_Scale,
  ASD_TimeSeries,
  ASD_Models,
  ASD_Explainability,
  ASD_Alert,
} from "./AspectSentimentDrift";
import {
  PG_Cascade,
  PG_ONNX,
  PG_Adversarial,
  PG_Explainability,
} from "./PowerGraph";
import {
  TWG_WearPhases,
  TWG_PhysicsPrior,
  TWG_ToolVariability,
  TWG_GlobalVsPerTraj,
} from "./ToolWearGPR";
import {
  DS_Pipeline,
  DS_SurvivalCurve,
  DS_ModelRace,
  DS_Bearing,
} from "./DissertationSurvival";
import { OGCoversShowreel } from "./OGCoversShowreel/OGCoversShowreel";
import { TOTAL_FRAMES, WIDTH, HEIGHT, FPS } from "./OGCoversShowreel/video-config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OGCoversShowreel"
        component={OGCoversShowreel}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition id="KVCache" component={KVCache} durationInFrames={270} fps={30} width={1200} height={630} />
      <Composition id="DiabetesFairness" component={DiabetesFairness} durationInFrames={390} fps={30} width={1200} height={630} />
      <Composition id="ASD-Scale" component={ASD_Scale} durationInFrames={150} fps={30} width={1200} height={630} />
      <Composition id="ASD-TimeSeries" component={ASD_TimeSeries} durationInFrames={210} fps={30} width={1200} height={630} />
      <Composition id="ASD-Models" component={ASD_Models} durationInFrames={180} fps={30} width={1200} height={630} />
      <Composition id="ASD-Explainability" component={ASD_Explainability} durationInFrames={300} fps={30} width={1200} height={630} />
      <Composition id="ASD-Alert" component={ASD_Alert} durationInFrames={120} fps={30} width={1200} height={630} />
      <Composition id="PowerGraph-Cascade" component={PG_Cascade} durationInFrames={390} fps={30} width={1200} height={630} />
      <Composition id="PowerGraph-ONNX" component={PG_ONNX} durationInFrames={360} fps={30} width={1200} height={630} />
      <Composition id="PowerGraph-Adversarial" component={PG_Adversarial} durationInFrames={390} fps={30} width={1200} height={630} />
      <Composition id="PowerGraph-Explainability" component={PG_Explainability} durationInFrames={330} fps={30} width={1200} height={630} />
      <Composition id="TWG-WearPhases" component={TWG_WearPhases} durationInFrames={390} fps={30} width={1200} height={630} />
      <Composition id="TWG-PhysicsPrior" component={TWG_PhysicsPrior} durationInFrames={360} fps={30} width={1200} height={630} />
      <Composition id="TWG-ToolVariability" component={TWG_ToolVariability} durationInFrames={330} fps={30} width={1200} height={630} />
      <Composition id="TWG-GlobalVsPerTraj" component={TWG_GlobalVsPerTraj} durationInFrames={390} fps={30} width={1200} height={630} />
      <Composition id="DS-Pipeline" component={DS_Pipeline} durationInFrames={390} fps={30} width={1200} height={630} />
      <Composition id="DS-SurvivalCurve" component={DS_SurvivalCurve} durationInFrames={330} fps={30} width={1200} height={630} />
      <Composition id="DS-ModelRace" component={DS_ModelRace} durationInFrames={360} fps={30} width={1200} height={630} />
      <Composition id="DS-Bearing" component={DS_Bearing} durationInFrames={330} fps={30} width={1200} height={630} />
    </>
  );
};
