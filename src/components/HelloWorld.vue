<script setup>
import { ref, reactive, computed, onMounted } from 'vue';

// 定数定義
const ROWS = 5;
const COLS = 9;

// アイテムの定義 (名前, 幅, 高さ)
const ITEM_TYPES = [
  { id: 'item-lg', name: 'ROBOT BOX', width: 3, height: 2 }, // 画像では3x2に見えるため調整
  { id: 'item-md', name: 'STATIONERY', width: 3, height: 1 },
  { id: 'item-sm', name: 'USB', width: 2, height: 1 },
];

// 状態管理
const board = ref([]);
const selectedCell = ref(null); // { r, c }
const openedCount = ref(0);
const isCleared = ref(false);

// 盤面の初期化
const initBoard = () => {
  const newBoard = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) {
      row.push({
        isOpen: false,
        itemId: null, // どのアイテムの一部か
        isItem: false,
        color: ['#fff4ad', '#b8e1ff', '#f5b8ff', '#d1e0ff'][Math.floor(Math.random() * 4)] // 画像の付箋色
      });
    }
    newBoard.push(row);
  }
  board.value = newBoard;

  // アイテムの配置 (簡易的な固定配置)
  placeItem(1, 2, ITEM_TYPES[0]); // 3x2
  placeItem(0, 6, ITEM_TYPES[1]); // 3x1
  placeItem(2, 7, ITEM_TYPES[2]); // 2x1
};

const placeItem = (row, col, item) => {
  for (let r = row; r < row + item.height; r++) {
    for (let c = col; c < col + item.width; c++) {
      if (board.value[r] && board.value[r][c]) {
        board.value[r][c].isItem = true;
        board.value[r][c].itemId = item.id;
      }
    }
  }
};

// マスを選択
const selectCell = (r, c) => {
  if (board.value[r][c].isOpen) return;
  selectedCell.value = { r, c };
};

// カードをめくる
const openCell = () => {
  if (!selectedCell.value) return;
  const { r, c } = selectedCell.value;
  const cell = board.value[r][c];

  if (!cell.isOpen) {
    cell.isOpen = true;
    openedCount.value++;
    checkClear();
  }
  selectedCell.value = null;
};

// クリア判定 (すべてのアイテムマスが開かれたか)
const checkClear = () => {
  const allItemsOpened = board.value.every(row =>
    row.every(cell => !cell.isItem || cell.isOpen)
  );
  if (allItemsOpened) {
    isCleared.value = true;
  }
};

onMounted(() => {
  initBoard();
});
</script>

<template>
  <div class="game-container">
    <div class="header">
      残りマス数：{{ (ROWS * COLS) - openedCount }}/{{ ROWS * COLS }}
    </div>

    <div class="board">
      <div v-for="(row, r) in board" :key="r" class="row">
        <div
          v-for="(cell, c) in row"
          :key="c"
          class="cell"
          :class="{
            'is-open': cell.isOpen,
            'is-selected': selectedCell?.r === r && selectedCell?.c === c
          }"
          :style="{ backgroundColor: cell.isOpen ? 'transparent' : cell.color }"
          @click="selectCell(r, c)"
        >
          <div v-if="cell.isOpen && cell.isItem" class="item-fragment">
            {{ cell.itemId === 'item-lg' ? '🤖' : '📦' }}
          </div>

          <div v-if="!cell.isOpen" class="corner"></div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="status-display">
        <span class="count">{{ openedCount }}</span>
        <span class="label">マスオープン</span>
      </div>
      <button
        class="open-button"
        :disabled="!selectedCell"
        @click="openCell"
      >
        めくる
      </button>
    </div>

    <div v-if="isCleared" class="clear-message">
      MISSION COMPLETE!
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f4f8;
  padding: 20px;
  font-family: 'Arial', sans-serif;
}

.board {
  display: grid;
  gap: 4px;
  background-color: #ffffff;
  padding: 10px;
  border: 2px solid #d1e0ff;
  border-radius: 4px;
  position: relative;
}

.row {
  display: flex;
  gap: 4px;
}

.cell {
  width: 60px;
  height: 60px;
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  transition: transform 0.1s;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
}

.cell:hover:not(.is-open) {
  transform: translateY(-2px);
}

.cell.is-selected {
  outline: 3px solid #4a90e2;
  z-index: 10;
}

.cell.is-open {
  background-color: #eef2f7 !important;
  box-shadow: inset 1px 1px 3px rgba(0,0,0,0.05);
}

.corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%);
}

.controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.open-button {
  background-color: #555;
  color: white;
  padding: 10px 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
}

.open-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status-display {
  background: #ddd;
  padding: 5px 20px;
  border-radius: 4px;
  text-align: center;
}

.clear-message {
  margin-top: 20px;
  font-weight: bold;
  color: #4a90e2;
  font-size: 2rem;
}
</style>
