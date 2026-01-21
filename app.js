document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     Elements – Inputs
  ========================= */
  const totalDoughInput = document.getElementById("totalDoughInput");
  const prefPct         = document.getElementById("prefPct");
  const prefHyd         = document.getElementById("prefHyd");
  const prefYeastPct    = document.getElementById("prefYeastPct");
  const waterPct        = document.getElementById("waterPct");
  const saltPct         = document.getElementById("saltPct");
  const yeastPct        = document.getElementById("yeastPct");

  const inputs = [
    totalDoughInput,
    prefPct,
    prefHyd,
    prefYeastPct,
    waterPct,
    saltPct,
    yeastPct
  ];

  /* =========================
     Elements – Outputs
  ========================= */
  const prefFlourEl = document.getElementById("prefFlour");
  const prefWaterEl = document.getElementById("prefWater");
  const prefYeastEl = document.getElementById("prefYeast");
  const prefTotalEl = document.getElementById("prefTotal");

  const mainFlourEl = document.getElementById("mainFlour");
  const mainWaterEl = document.getElementById("mainWater");
  const saltEl      = document.getElementById("salt");
  const yeastEl     = document.getElementById("yeast");
  const mainTotalEl = document.getElementById("mainTotal");

  const totalFlourEl = document.getElementById("totalFlour");
  const totalWaterEl = document.getElementById("totalWater");
  const totalCheckEl = document.getElementById("totalCheck");

  /* =========================
     Settings panel elements
  ========================= */
  const settingsBtn   = document.getElementById("settingsBtn");
  const settingsPanel = document.getElementById("settingsPanel");

  const themeToggle   = document.getElementById("themeToggle");
  const themeIcon     = document.getElementById("themeIcon");

  const usePref       = document.getElementById("usePref");
  const prefSection   = document.getElementById("prefSection");

  const recipeToggle         = document.getElementById("recipeToggle");
  const recipeSection        = document.getElementById("recipeSection");
  const recipeSelectWrapper  = document.getElementById("recipeSelectWrapper");
  const recipeInsertPoint    = document.getElementById("recipeInsertPoint");

  const recipeNameInput      = document.getElementById("recipeNameInput");
  const saveRecipeBtn        = document.getElementById("saveRecipeBtn");
  const deleteRecipeBtn = document.getElementById("deleteRecipeBtn");
  const recipeSelect         = document.getElementById("recipeSelect");
  const exportBtn            = document.getElementById("exportRecipesBtn");
  const importBtn            = document.getElementById("importRecipesBtn");
  const importInput          = document.getElementById("importRecipesInput");

  /* =========================
     Settings panel toggle
  ========================= */
  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.toggle("open");
  });

  /* =========================
     Theme toggle (Dark / Light)
  ========================= */
  (() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    applyTheme(savedTheme);
    themeToggle.checked = savedTheme === "light";

    themeToggle.addEventListener("change", () => {
      const theme = themeToggle.checked ? "light" : "dark";
      applyTheme(theme);
      localStorage.setItem("theme", theme);
    });

    function applyTheme(theme) {
      document.body.classList.remove("dark", "light");
      document.body.classList.add(theme);
      themeIcon.textContent = theme === "light" ? "☀️" : "🌙";
    }
  })();

  /* =========================
     Fördeg toggle
  ========================= */
  (() => {
    const savedPref = localStorage.getItem("usePref") === "1";
    usePref.checked = savedPref;
    prefSection.classList.toggle("collapsed", !savedPref);
    if (!savedPref) prefPct.value = 0;

    usePref.addEventListener("change", () => {
      const isOn = usePref.checked;
      prefSection.classList.toggle("collapsed", !isOn);
      if (!isOn) prefPct.value = 0;
      localStorage.setItem("usePref", isOn ? "1" : "0");
      recalc();
    });
  })();

  /* =========================
     Recept toggle + flytta selector
  ========================= */
  const recipeOriginalParent = recipeSelectWrapper.parentNode;
  const recipeOriginalNext   = recipeSelectWrapper.nextSibling;

  // Init
  moveRecipeSelector(recipeToggle.checked);
  recipeToggle.checked = false;
  recipeSection.classList.add("collapsed");

  recipeToggle.addEventListener("change", () => {
    const enabled = recipeToggle.checked;
    recipeSection.classList.toggle("collapsed", !enabled);
    moveRecipeSelector(enabled);
  });

  function moveRecipeSelector(enabled) {
    if (enabled) {
      recipeInsertPoint.appendChild(recipeSelectWrapper);
    } else {
      recipeOriginalParent.insertBefore(recipeSelectWrapper, recipeOriginalNext);
    }
  }

  /* =========================
     Recept data & persistence
  ========================= */
  let recipes = JSON.parse(localStorage.getItem("recipes") || "[]");
  if (!Array.isArray(recipes)) recipes = [];
  refreshDropdown();

  saveRecipeBtn.addEventListener("click", () => {
    const name = recipeNameInput.value.trim();
    if (!name) return alert("Skriv ett namn på receptet!");

    const newRecipe = {
      D: Number(totalDoughInput.value),
      P: Number(prefPct.value),
      PH: Number(prefHyd.value),
      PY: Number(prefYeastPct.value),
      W: Number(waterPct.value),
      S: Number(saltPct.value),
      Y: Number(yeastPct.value),
      name
    };

    recipes.push(newRecipe);
    localStorage.setItem("recipes", JSON.stringify(recipes));
    refreshDropdown();
    recipeNameInput.value = "";
  });
  
  deleteRecipeBtn.addEventListener("click", () => {
  const idx = recipeSelect.value;

  if (idx === "") {
    alert("Välj ett recept att radera.");
    return;
  }

  const name = recipes[idx].name;
  const confirmDelete = confirm(`Radera receptet "${name}"?`);

  if (!confirmDelete) return;

  recipes.splice(idx, 1);
  localStorage.setItem("recipes", JSON.stringify(recipes));

  refreshDropdown();
  recipeSelect.value = "";
});

  function refreshDropdown() {
    if (!Array.isArray(recipes)) recipes = [];
    recipeSelect.innerHTML = `<option value="">– Välj sparat recept –</option>`;
    recipes.forEach((r, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = r.name;
      recipeSelect.appendChild(option);
    });
  }

  recipeSelect.addEventListener("change", () => {
    const idx = recipeSelect.value;
    if (idx === "") return;

    const r = recipes[idx];
    totalDoughInput.value = r.D;
    prefPct.value         = r.P;
    prefHyd.value         = r.PH;
    prefYeastPct.value    = r.PY;
    waterPct.value        = r.W;
    saltPct.value         = r.S;
    yeastPct.value        = r.Y;

    recalc();
  });

  exportBtn.addEventListener("click", () => {
    if (!recipes.length) return alert("Inga recept att exportera!");
    const blob = new Blob([JSON.stringify(recipes, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "recept.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener("click", () => importInput.click());

  importInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error("Felaktig fil! Måste vara en array av recept.");
        recipes = imported;
        localStorage.setItem("recipes", JSON.stringify(recipes));
        refreshDropdown();
        alert("Recept importerade!");
      } catch (err) {
        alert("Kunde inte importera fil: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  /* =========================
     Recalc
  ========================= */
  function recalc() {
    const D  = Number(totalDoughInput.value);
    if (!D || D <= 0) return;

    const P  = Number(prefPct.value) / 100;
    const PH = Number(prefHyd.value) / 100;
    const PY = Number(prefYeastPct.value) / 100;
    const W  = Number(waterPct.value) / 100;
    const S  = Number(saltPct.value) / 100;
    const Y  = Number(yeastPct.value) / 100;

    const totalFlour = D / (1 + W + S + Y);
    const totalWater = totalFlour * W;
    const salt       = totalFlour * S;
    const totalYeast = totalFlour * Y;

    const prefFlour  = totalFlour * P;
    const prefWater  = Math.min(prefFlour * PH, totalWater);
    const prefYeast  = prefFlour * PY;
    const prefTotal  = prefFlour + prefWater + prefYeast;

    const mainFlour  = totalFlour - prefFlour;
    const mainWater  = Math.max(totalWater - prefWater, 0);
    const mainYeast  = totalYeast - prefYeast;
    const mainTotal  = mainFlour + mainWater + mainYeast + salt;

    prefFlourEl.textContent = Math.round(prefFlour);
    prefWaterEl.textContent = Math.round(prefWater);
    prefYeastEl.textContent = prefYeast.toFixed(1);
    prefTotalEl.textContent = Math.round(prefTotal);

    mainFlourEl.textContent = Math.round(mainFlour);
    mainWaterEl.textContent = Math.round(mainWater);
    saltEl.textContent      = salt.toFixed(1);
    yeastEl.textContent     = mainYeast.toFixed(1);
    mainTotalEl.textContent = Math.round(mainTotal);

    totalFlourEl.textContent = Math.round(totalFlour);
    totalWaterEl.textContent = Math.round(totalWater);
    totalCheckEl.textContent = Math.round(prefTotal + mainTotal);
  }

  /* =========================
     Persist inputs
  ========================= */
  inputs.forEach(input => {
    const saved = localStorage.getItem(input.id);
    if (saved !== null) input.value = saved;

    input.addEventListener("input", () => {
      localStorage.setItem(input.id, input.value);
      recalc();
    });
  });

  /* =========================
     Init
  ========================= */
  recalc();
});
