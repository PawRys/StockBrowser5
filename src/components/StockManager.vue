<script setup lang="ts"></script>

<template>
  <div>
    <h2>StockManager</h2>

    <section>
      <label class="button switch text-btn">
        <span>m<sup>3</sup></span>
        <input type="checkbox" hidden="" />
      </label>
      <label class="button switch text-btn">
        <span>m<sup>2</sup></span>
        <input type="checkbox" hidden="" />
      </label>
      <label class="button switch text-btn">
        <span>szt</span>
        <input type="checkbox" hidden="" />
      </label>
      <label class="button switch">
        <span>m<sup>3</sup></span>
        <input type="checkbox" hidden="" />
      </label>
      <label class="button switch">
        <span>m<sup>2</sup></span>
        <input type="checkbox" hidden="" />
      </label>
      <label class="button switch">
        <span>szt</span>
        <input type="checkbox" hidden="" />
      </label>

      <button class="active">Button</button>
      <button class="">Button</button>
      <button class="">Button</button>
      <button class="light active">Button</button>
      <button class="light">Button</button>
      <button class="light">Button</button>
      <button class="toned active">Button</button>
      <button class="toned">Button</button>
      <button class="toned">Button</button>
      <button class="cta">Button</button>
    </section>

    <!-- <section>
      <div class="color" style="background: Navy"><span>Navy</span></div>
      <div class="color" style="background: DarkBlue"><span>DarkBlue</span></div>
      <div class="color" style="background: MediumBlue"><span>MediumBlue</span></div>
      <div class="color" style="background: Blue"><span>Blue</span></div>
      <div class="color" style="background: MidnightBlue"><span>MidnightBlue</span></div>
      <div class="color" style="background: RoyalBlue"><span>RoyalBlue</span></div>
      <div class="color" style="background: SteelBlue"><span>SteelBlue</span></div>
      <div class="color" style="background: DodgerBlue"><span>DodgerBlue</span></div>
      <div class="color" style="background: SlateBlue"><span>SlateBlue</span></div>
      <div class="color" style="background: MediumSlateBlue"><span>MediumSlateBlue</span></div>
      <div class="color" style="background: BlueViolet"><span>BlueViolet</span></div>
      <div class="color" style="background: CadetBlue"><span>CadetBlue</span></div>
      <div class="color" style="background: CornflowerBlue"><span>CornflowerBlue</span></div>
      <div class="color" style="background: SkyBlue"><span>SkyBlue</span></div>
      <div class="color" style="background: LightSkyBlue"><span>LightSkyBlue</span></div>
      <div class="color" style="background: LightSteelBlue"><span>LightSteelBlue</span></div>
      <div class="color" style="background: PowderBlue"><span>PowderBlue</span></div>
      <div class="color" style="background: LightBlue"><span>LightBlue</span></div>
      <div class="color" style="background: DeepSkyBlue"><span>DeepSkyBlue</span></div>
      <div class="color" style="background: AliceBlue"><span>AliceBlue</span></div>

      (#000080) (#00008B) (#0000CD) (#0000FF) (#191970) (#4169E1) (#4682B4) (#1E90FF) (#6A5ACD)
      (#7B68EE) (#8A2BE2) (#5F9EA0) (#6495ED) (#87CEEB) (#87CEFA) (#B0C4DE) (#B0E0E6) (#ADD8E6)
      (#00BFFF) (#F0F8FF)
    </section> -->
  </div>
</template>

<style scoped>
section {
  display: flex;
}
.color {
  aspect-ratio: 1/1;
  width: 120px;
  background-color: aqua;
  margin: 5px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.color span {
  background-color: white;
  width: 100%;
  text-align: center;
}
</style>
