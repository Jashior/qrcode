<script lang="ts">
  import { onMount } from "svelte";
  import { toCanvas } from "qrcode";
  import jsQR, { type QRCode } from "jsqr";
  import ColorPicker from "svelte-awesome-color-picker";

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let decodedData: string | null = null;
  let inputUrl: string = "https://qrcode.zanaris.dev";
  let paintColor: string = "#000000";
  let isPainting: boolean = false;
  let isReading: boolean = false;
  let showFlash: boolean = false;
  const SCALE = 10;
  const MARGIN = 4;
  const QR_MODULE_COUNT = 29; // Standard for QR codes
  const CANVAS_SIZE = (QR_MODULE_COUNT + MARGIN * 2) * SCALE;

  onMount(() => {
    ctx = canvas.getContext("2d")!;
  });

  function generateQRCode() {
    if (!canvas) return;
    toCanvas(
      canvas,
      inputUrl,
      {
        errorCorrectionLevel: "H",
        scale: SCALE,
        margin: MARGIN,
        width: 370,
        height: 370,
      },
      (error: Error) => {
        if (error) {
          console.error("Error generating QR code:", error);
          return;
        }
        console.log("QR code generated successfully");
        readQRCode();
      },
    );
  }

  async function readQRCode() {
    if (!ctx) return;
    isReading = true;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate processing time

    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // console.log(imageData);
    const code = jsQR(imageData.data, CANVAS_SIZE, CANVAS_SIZE, {
      inversionAttempts: "attemptBoth",
    });

    if (code) {
      decodedData = code.data;
      // console.log("QR code decoded:", decodedData);
    } else {
      console.log("No QR code found");
      decodedData = null;
    }

    isReading = false;
    showFlash = true;
    setTimeout(() => (showFlash = false), 300); // Remove flash after 300ms
  }

  function startPainting(event: MouseEvent) {
    isPainting = true;
    paint(event);
  }

  function stopPainting() {
    isPainting = false;
  }

  function paint(event: MouseEvent) {
    if (!isPainting || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.fillStyle = paintColor;
    ctx.fillRect(
      Math.floor(x / SCALE) * SCALE,
      Math.floor(y / SCALE) * SCALE,
      SCALE,
      SCALE,
    );

    readQRCode();
  }

  $: decodedDataColor =
    decodedData === inputUrl ? "text-green-600" : "text-red-600";
  $: decodedBorderColor =
    decodedData === inputUrl ? "border-green-600" : "border-red-600";
</script>

<main class="w-full flex justify-center items-center min-h-screen bg-gray-100">
  <div
    class="w-96 flex flex-col items-center space-y-4 bg-white p-6 rounded-lg shadow-md"
  >
    <div class="flex flex-col w-full space-y-2">
      <input
        bind:value={inputUrl}
        type="text"
        id="default-input"
        placeholder="Enter URL for QR code"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      />
      <button
        on:click={generateQRCode}
        class="waves-effect waves-light rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        type="button"
      >
        Generate QR Code
      </button>
    </div>
    <canvas
      class="border-2 rounded {decodedBorderColor} cursor-crosshair"
      bind:this={canvas}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      on:mousedown={startPainting}
      on:mousemove={paint}
      on:mouseup={stopPainting}
      on:mouseleave={stopPainting}
    ></canvas>
    <div class="flex items-center space-x-2 flex-col">
      <span class="text-xs" style="color: {paintColor}"
        >Color: {paintColor}</span
      >
      <ColorPicker bind:hex={paintColor} position="responsive" />
    </div>

    <hr class="w-full border-t border-gray-300" />
    <div class="h-64">
      <p class="max-w-96 text-center font-medium {decodedDataColor}">
        {#if isReading}
          ...
        {:else}
          {decodedData || "No data decoded"}
        {/if}
      </p>
    </div>
  </div>
</main>

<style>
  .color-span {
    color: var(--paintColor);
  }
</style>
