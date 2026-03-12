<script setup>
import { ref, computed, onMounted } from 'vue';

const ROWS = 5;
const COLS = 9;

const ITEM_TYPES = [
  { id: 'item-lg', name: 'ROBOT BOX', width: 3, height: 2 },
  { id: 'item-md', name: 'STATIONERY', width: 3, height: 1 },
  { id: 'item-sm', name: 'USB', width: 2, height: 1 },
];

const board = ref([]);
const selectedCells = ref([]);
const isCleared = ref(false);
const placedItems = ref([]);

const initBoard = () => {
  isCleared.value = false;
  selectedCells.value = [];
  placedItems.value = [];

  const newBoard = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        isOpen: false,
        itemId: null,
        isItem: false,
        typeId: null,
        originR: 0,
        originC: 0,
        color: ['#fff4ad', '#b8e1ff', '#f5b8ff', '#d1e0ff'][Math.floor(Math.random() * 4)]
      });
    }
    newBoard.push(row);
  }
  board.value = newBoard;

  ITEM_TYPES.forEach(type => {
    const count = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < count; i++) {
      tryPlaceItemRandomly(type, `${type.id}-${i}`);
    }
  });
};

const tryPlaceItemRandomly = (type, instanceId) => {
  const maxAttempts = 100;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const rotate = Math.random() > 0.5;
    const finalWidth = rotate ? type.height : type.width;
    const finalHeight = rotate ? type.width : type.height;

    const r = Math.floor(Math.random() * (ROWS - finalHeight + 1));
    const c = Math.floor(Math.random() * (COLS - finalWidth + 1));

    let canPlace = true;
    for (let dr = 0; dr < finalHeight; dr++) {
      for (let dc = 0; dc < finalWidth; dc++) {
        if (board.value[r + dr][c + dc].isItem) {
          canPlace = false;
          break;
        }
      }
      if (!canPlace) break;
    }

    if (canPlace) {
      registerItem(r, c, type, instanceId, rotate);
      return;
    }
  }
};

const registerItem = (row, col, type, instanceId, rotate) => {
  const cells = [];
  const finalWidth = rotate ? type.height : type.width;
  const finalHeight = rotate ? type.width : type.height;

  for (let dr = 0; dr < finalHeight; dr++) {
    for (let dc = 0; dc < finalWidth; dc++) {
      const cell = board.value[row + dr][col + dc];
      cell.isItem = true;
      cell.itemId = instanceId;
      cell.typeId = type.id;
      cell.originR = dr;
      cell.originC = dc;
      cells.push({ r: row + dr, c: col + dc });
    }
  }
  placedItems.value.push({ id: instanceId, typeId: type.id, name: type.name, cells, width: finalWidth, height: finalHeight });
};

const getFragmentText = (cell) => {
  const { typeId, originR, originC } = cell;
  const item = placedItems.value.find(i => i.id === cell.itemId);
  if (!item) return '';

  const w = item.width;
  const h = item.height;

  if (typeId === 'item-md') {
    if (w > h) {
      if (originC === 0) return '✎';
      if (originC === w - 1) return '目';
      return '＝';
    } else {
      if (originR === 0) return '▲';
      if (originR === h - 1) return '目';
      return '┃';
    }
  }
  if (typeId === 'item-sm') {
    if (w > h) return originC === 0 ? '▤' : '▶';
    else return originR === 0 ? '▤' : '▼';
  }
  if (typeId === 'item-lg') {
    if (originR === 0 && originC === 0) return '┏';
    if (originR === 0 && originC === w - 1) return '┓';
    if (originR === h - 1 && originC === 0) return '┗';
    if (originR === h - 1 && originC === w - 1) return '┛';
    return '🤖';
  }
  return '？';
};

const itemStatusList = computed(() => {
  return ITEM_TYPES.map(type => {
    const instances = placedItems.value.filter(item => item.typeId === type.id);
    const remaining = instances.filter(item =>
      !item.cells.every(pos => board.value[pos.r][pos.c].isOpen)
    ).length;
    return { ...type, remaining };
  });
});

const openedCount = computed(() => board.value.flat().filter(c => c.isOpen).length);
const remainingItemsCount = computed(() => {
  return itemStatusList.value.reduce((acc, curr) => acc + curr.remaining, 0);
});

const toggleCellSelection = (r, c) => {
  if (board.value[r][c].isOpen) return;
  const index = selectedCells.value.findIndex(cell => cell.r === r && cell.c === c);
  if (index > -1) selectedCells.value.splice(index, 1);
  else selectedCells.value.push({ r, c });
};

const isSelected = (r, c) => selectedCells.value.some(cell => cell.r === r && cell.c === c);

const openSelectedCells = () => {
  selectedCells.value.forEach(pos => { board.value[pos.r][pos.c].isOpen = true; });
  selectedCells.value = [];
  checkClear();
};

const checkClear = () => {
  if (remainingItemsCount.value === 0 && placedItems.value.length > 0) isCleared.value = true;
};

onMounted(() => initBoard());
</script>

<template>
  <div class="game-container">
    <div class="header">
      <div class="info-row">
        <span>{{ openedCount }}マスオープン / {{ ROWS * COLS }}マス</span>
      </div>
    </div>

    <div class="board">
      <div v-for="(row, r) in board" :key="r" class="row">
        <div
          v-for="(cell, c) in row"
          :key="c"
          class="cell"
          :class="{
            'is-open': cell.isOpen,
            'is-selected': isSelected(r, c),
            'has-item': cell.isItem && cell.isOpen
          }"
          :style="{ backgroundColor: cell.isOpen ? 'transparent' : cell.color }"
          @click="toggleCellSelection(r, c)"
        >
          <div v-if="cell.isOpen && cell.isItem" class="item-fragment">
            <span class="fragment-text">{{ getFragmentText(cell) }}</span>
          </div>
          <div v-if="!cell.isOpen" class="corner"></div>
        </div>
      </div>
    </div>

    <div class="item-catalog">
      <div v-for="item in itemStatusList" :key="item.id" class="catalog-card" :class="{ 'is-complete': item.remaining === 0 }">
        <div class="catalog-shape">
          <div class="shape-grid" :style="{ gridTemplateColumns: `repeat(${item.width}, 1fr)` }">
            <div v-for="n in (item.width * item.height)" :key="n" class="shape-dot"></div>
          </div>
        </div>
        <div class="catalog-info">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-count">× {{ item.remaining }}</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="button-group">
        <button class="open-button" :disabled="selectedCells.length === 0 || isCleared" @click="openSelectedCells">
          {{ selectedCells.length > 0 ? `${selectedCells.length}枚めくる` : 'めくる' }}
        </button>
        <button class="reset-button" @click="initBoard">リセット</button>
      </div>
    </div>

    <div v-if="isCleared" class="clear-message">MISSION COMPLETE!</div>
  </div>
</template>

<style scoped>
.game-container { display: flex; flex-direction: column; align-items: center; padding: 40px 20px; background-color: #f8fbff; min-height: 100vh; box-sizing: border-box; }
.header { width: 100%; max-width: 500px; margin-bottom: 15px; }
.info-row { display: flex; justify-content: center; width: 100%; font-weight: bold; font-size: 1.1rem; color: #444; }
.board { display: grid; gap: 4px; padding: 10px; background: white; border: 1px solid #e0e6ed; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.row { display: flex; gap: 4px; }
.cell {
  width: 45px; height: 45px; position: relative; cursor: pointer; border-radius: 2px;
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
  transition: all 0.2s ease;
}
.cell.is-selected { outline: 3px solid #4a90e2; z-index: 5; transform: scale(1.1); box-shadow: 0 0 10px rgba(74, 144, 226, 0.5); }
.cell.has-item { background-color: #f0f7ff !important; border: 1px solid #c1d5f0; color: #4a90e2; font-weight: bold; }
.cell.is-open { background-color: #fafafa !important; }

.item-catalog { display: flex; gap: 12px; margin: 20px 0; padding: 15px; background: #fff; border-radius: 8px; border: 1px dashed #ccd6e0; flex-wrap: wrap; justify-content: center; }
.catalog-card { display: flex; align-items: center; gap: 12px; padding: 8px 15px; background: #fdfdfd; border: 1px solid #eee; border-radius: 4px; min-width: 120px; }
.catalog-card.is-complete { opacity: 0.3; filter: grayscale(1); }
.catalog-info { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
.item-name { font-size: 0.7rem; font-weight: bold; color: #888; white-space: nowrap; }
.item-count { font-size: 1.1rem; font-weight: 800; color: #4a90e2; }

.shape-grid { display: grid; gap: 2px; }
.shape-dot { width: 7px; height: 7px; background: #4a90e2; border-radius: 1px; }

.controls { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.button-group { display: flex; gap: 12px; }
.open-button { background: #333; color: white; padding: 12px 24px; min-width: 140px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.open-button:disabled { background: #ccc; cursor: not-allowed; }
.reset-button { background: #eee; color: #666; border: none; padding: 12px 20px; border-radius: 4px; cursor: pointer; }

.clear-message { margin-top: 20px; font-size: 1.8rem; color: #4a90e2; font-weight: 800; }
.corner { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%); }
</style>
