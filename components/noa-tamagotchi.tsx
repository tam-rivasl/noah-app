"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import StatusBars from "./status-bars";
import ActionButtons from "./action-buttons";
import NoaWalking from "./noa-walking";
import NoaEating from "./noa-eating";
import NoaSleeping from "./noa-sleeping";
import { NoaPetting } from "./noa-petting";

// Importa tus minijuegos:
import MiniGameCatch from "./mini-game-catch";
import MiniGameSpace from "./mini-game-space";
import AudioSettingsModal from "./AudioSettingsModal";
import GamesModal from "./games-modal";
import ShopScreen, {
  type ShopCategory,
  type ShopItem,
  type ShopMenuOption,
} from "@/components/shop-screen";

export type NoaState = {
  hunger: number;
  happiness: number;
  energy: number;
  lastUpdated: number;
};

type Inventory = {
  plant: boolean;
  teddy: boolean;
  themes: string[];
  decorations: string[];
  toys: string[];
};

const initialState: NoaState = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  lastUpdated: Date.now(),
};

const initialInventory: Inventory = {
  plant: false,
  teddy: false,
  themes: [],
  decorations: [],
  toys: [],
};

const SHOP_CATEGORIES: ShopCategory[] = [
  "food",
  "toys",
  "theme",
  "decoration",
];

const SHOP_MENU_OPTIONS: ShopMenuOption[] = ["inventory", ...SHOP_CATEGORIES];
const INVENTORY_CATEGORY_ORDER: Record<string, number> = {
  decoration: 0,
  toys: 1,
  theme: 2,
};
const SHELF_POSITIONS = [
  { left: "25%", top: "16%" },
  { left: "40%", top: "16%" },
  { left: "54%", top: "16%" },
  { left: "25%", top: "36%" },
  { left: "53%", top: "36%" },
  { left: "76%", top: "36%" },
];
const MAX_ACTIVE_ITEMS = SHELF_POSITIONS.length;

const FALLBACK_SHOP_ITEMS: ShopItem[] = [
  {
    id: "food-01",
    name: "Jugo de naranja",
    description: "Recupera algo de energia.",
    price: 6,
    category: "food",
    image_url: "/images/shop-items/food/orange-juice.png",
  },
  {
    id: "food-02",
    name: "Hamburguesa especial",
    description: "Comida completa que recarga energia y felicidad.",
    price: 10,
    category: "food",
    image_url: "/images/shop-items/food/hamburguesa-food.png",
  },
  {
    id: "food-03",
    name: "Comida casera",
    description: "Un plato abundante que llena la pancita.",
    price: 9,
    category: "food",
    image_url: "/images/shop-items/food/comida-plato.png",
  },
  {
    id: "food-04",
    name: "Huesito crujiente",
    description: "Snack rapido que sube la energia.",
    price: 5,
    category: "food",
    image_url: "/images/shop-items/food/huesito-food.png",
  },
  {
    id: "toys-01",
    name: "Cotito",
    description: "Juguete suave y reconfortante.",
    price: 12,
    category: "toys",
    image_url: "/images/shop-items/toys/cotito.png",
  },
  {
    id: "toys-02",
    name: "Dragoncito",
    description: "Sube felicidad rapido.",
    price: 15,
    category: "toys",
    image_url: "/images/shop-items/toys/dragoncito.png",
  },
  {
    id: "toys-03",
    name: "Majin Buu",
    description: "Juguete grande, aumenta felicidad.",
    price: 18,
    category: "toys",
    image_url: "/images/shop-items/toys/majimbuu.png",
  },
  {
    id: "toys-04",
    name: "Peluche Cute",
    description: "Favorito de Noa.",
    price: 10,
    category: "toys",
    image_url: "/images/shop-items/toys/peluche_cute.png",
  },
  {
    id: "theme-01",
    name: "Tema azul con patitas",
    description: "Skin azul con huellas.",
    price: 20,
    category: "theme",
    image_url: "/images/shop-items/theme/azul-con-patitas.png",
  },
  {
    id: "theme-02",
    name: "Tema azul simple",
    description: "Skin azul minimal.",
    price: 18,
    category: "theme",
    image_url: "/images/shop-items/theme/azul-patitas.png",
  },
  {
    id: "theme-03",
    name: "Tema Game Boy",
    description: "Skin estilo consola.",
    price: 22,
    category: "theme",
    image_url: "/images/shop-items/theme/game-boy.png",
  },
  {
    id: "theme-04",
    name: "Tema textura",
    description: "Fondo texturizado.",
    price: 16,
    category: "theme",
    image_url: "/images/shop-items/theme/texture4.png",
  },
  {
    id: "dec-01",
    name: "Casa deco",
    description: "Decoracion para el fondo.",
    price: 14,
    category: "decoration",
    image_url: "/images/shop-items/decoration/house.png",
  },
  {
    id: "dec-02",
    name: "Plantita",
    description: "Pequena planta decorativa.",
    price: 9,
    category: "decoration",
    image_url: "/images/shop-items/decoration/plantita.png",
  },
];

export default function NoaTamagotchi() {
  const [noaState, setNoaState] = useState<NoaState>(initialState);
  const [inventory, setInventory] = useState<Inventory>(initialInventory);
  const [activeItemIds, setActiveItemIds] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState<
      "eating" | "petting" | "gaming" | null
  >(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [screen, setScreen] = useState<"start" | "main" | "catch" | "space">(
      "start",
  );
  const [moveCommand, setMoveCommand] = useState<
      "left" | "right" | "up" | "down" | null
  >(null);
  const [startCommand, setStartCommand] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const menuOptions: ("catch" | "space")[] = ["catch", "space"];
  const [time, setTime] = useState(new Date());
  const [backgroundImage, setBackgroundImage] = useState<string>(
      "/images/back-grounds/day.png",
  );
  const [noaDead, setNoaDead] = useState(false);
  const [visible, setShowSoundModal] = useState(false);
  const [shopVisible, setShopVisible] = useState(false);
  const [volume, setVolume] = useState(1); // de 0.0 a 1.0
  const [selectedIcon, setSelectedIcon] = useState<
      "none" | "settings" | "shop" | "games"
  >("none");
  const [gamesVisible, setGamesVisible] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const [shopIndex, setShopIndex] = useState(0);
  const [shopCategory, setShopCategory] = useState<ShopMenuOption | null>(null);
  const [shopItems] = useState<ShopItem[]>(FALLBACK_SHOP_ITEMS);
  const [coinsSpent, setCoinsSpent] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [shopConfirm, setShopConfirm] = useState<string | null>(null);
  const [shopError, setShopError] = useState<string | null>(null);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [actionSoundEnabled, setActionSoundEnabled] = useState(true);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [inventoryConfirm, setInventoryConfirm] = useState<{
    id: string;
    type: "theme" | "toggle";
  } | null>(null);

  const deriveDefaultActiveItems = useCallback(
      (inv: Partial<Inventory>) => {
        const ids: string[] = [];
        const decorations = [...(inv.decorations ?? [])];
        if (inv.plant) decorations.unshift("dec-02");
        const toys = [...(inv.toys ?? [])];
        if (inv.teddy) toys.unshift("toys-04");

        [...decorations, ...toys].forEach((id) => {
          if (ids.length < MAX_ACTIVE_ITEMS && !ids.includes(id)) {
            ids.push(id);
          }
        });
        return ids;
      },
      [],
  );

  useEffect(() => {
    const spent = localStorage.getItem("coinsSpent");
    if (spent) setCoinsSpent(parseInt(spent, 10));
    const earned = localStorage.getItem("coinsEarned");
    if (earned) setCoinsEarned(parseInt(earned, 10));
    const inv = localStorage.getItem("inventory");
    let parsedInventory: Partial<Inventory> | null = null;
    if (inv) {
      parsedInventory = JSON.parse(inv) as Partial<Inventory>;
      setInventory({
        plant: !!parsedInventory.plant,
        teddy: !!parsedInventory.teddy,
        themes: parsedInventory.themes ?? [],
        decorations: parsedInventory.decorations ?? [],
        toys: parsedInventory.toys ?? [],
      });
      if (parsedInventory.themes && parsedInventory.themes.length > 0) {
        setActiveThemeId(
            parsedInventory.themes[parsedInventory.themes.length - 1],
        );
      }
    }
    const savedActiveItems = localStorage.getItem("activeItemIds");
    if (savedActiveItems) {
      try {
        const parsed = JSON.parse(savedActiveItems) as string[];
        setActiveItemIds(parsed.slice(0, MAX_ACTIVE_ITEMS));
      } catch (err) {
        console.error("Error leyendo items activos", err);
      }
    } else {
      setActiveItemIds(
          deriveDefaultActiveItems(parsedInventory ?? initialInventory),
      );
    }
    const savedTheme = localStorage.getItem("activeThemeId");
    if (savedTheme) setActiveThemeId(savedTheme);
    const purchased = localStorage.getItem("purchasedItemIds");
    if (purchased) {
      try {
        const parsedPurchased = JSON.parse(purchased) as string[];
        setPurchasedItemIds(parsedPurchased);
      } catch (err) {
        console.error("Error leyendo compras previas", err);
      }
    }
  }, [deriveDefaultActiveItems]);

  const allItemsMap = useMemo(() => {
    const map = new Map<string, ShopItem>();
    FALLBACK_SHOP_ITEMS.forEach((item) => map.set(item.id, item));
    shopItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [shopItems]);

  const activeThemeImage = useMemo(() => {
    if (!activeThemeId) return null;
    return allItemsMap.get(activeThemeId)?.image_url ?? null;
  }, [activeThemeId, allItemsMap]);

  const gameboyStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!activeThemeImage) return undefined;
    return { ["--gameboy-bg" as string]: `url(${activeThemeImage})` };
  }, [activeThemeImage]);

  const ownedItemIds = useMemo(() => {
    const ids = new Set<string>();
    purchasedItemIds.forEach((id) => {
      const item = allItemsMap.get(id);
      if (item && item.category !== "food") ids.add(id);
    });
    inventory.themes.forEach((id) => ids.add(id));
    inventory.decorations.forEach((id) => ids.add(id));
    inventory.toys.forEach((id) => ids.add(id));
    if (inventory.plant) ids.add("dec-02");
    if (inventory.teddy) ids.add("toys-04");
    return Array.from(ids);
  }, [inventory, purchasedItemIds, allItemsMap]);

  const ownedItems = useMemo(
      () =>
          ownedItemIds
              .map((id) => allItemsMap.get(id))
              .filter(Boolean) as ShopItem[],
      [ownedItemIds, allItemsMap],
  );

  const ownedIdsSet = useMemo(
      () => new Set<string>(ownedItemIds),
      [ownedItemIds],
  );

  const availableShopItems = useMemo(
      () =>
          shopItems.filter(
              (item) => item.category === "food" || !ownedIdsSet.has(item.id),
          ),
      [shopItems, ownedIdsSet],
  );

  const inventoryItems = useMemo(() => {
    const items = ownedItems.filter((item) => item.category !== "food");
    const sorted = [...items].sort((a, b) => {
      const aActive = activeItemIds.includes(a.id) ? 1 : 0;
      const bActive = activeItemIds.includes(b.id) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      const aOrder = INVENTORY_CATEGORY_ORDER[a.category] ?? 99;
      const bOrder = INVENTORY_CATEGORY_ORDER[b.category] ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [ownedItems, activeItemIds]);

  const shelfItems = useMemo(
      () =>
          activeItemIds
              .map((id) => allItemsMap.get(id))
              .filter(
                  (item): item is ShopItem =>
                      !!item &&
                      (item.category === "toys" ||
                          (item.category === "decoration" && item.id === "dec-02")),
              ),
      [activeItemIds, allItemsMap],
  );

  const houseItem = useMemo(
      () =>
          activeItemIds
              .map((id) => allItemsMap.get(id))
              .find((item) => item?.id === "dec-01") ?? null,
      [activeItemIds, allItemsMap],
  );

  const money = coinsEarned - coinsSpent;

  const confirmInventoryAction = (confirm: { id: string; type: "theme" | "toggle" }) => {
    const item =
        inventoryItems.find((i) => i.id === confirm.id) ||
        allItemsMap.get(confirm.id);
    if (!item) {
      setInventoryConfirm(null);
      return;
    }
    if (confirm.type === "theme") {
      setActiveThemeId(item.id);
      setShopError(null);
      setInventoryConfirm(null);
      return;
    }
    togglePlacement(item.id);
    setInventoryConfirm(null);
  };

  const resetGame = () => {
    [
      "noaState",
      "coinsSpent",
      "coinsEarned",
      "inventory",
      "purchasedItemIds",
      "activeThemeId",
      "activeItemIds",
      "lastSavedStatAt",
      "game_scores",
      "game_scores_catch",
      "game_scores_space",
      "last_catch_run_id",
      "last_space_run_id",
    ].forEach((key) => localStorage.removeItem(key));
    ["last_catch_run_id", "last_space_run_id"].forEach((key) =>
        sessionStorage.removeItem(key),
    );

    setNoaState({ ...initialState, lastUpdated: Date.now() });
    setInventory(initialInventory);
    setActiveItemIds([]);
    setPurchasedItemIds([]);
    setActiveThemeId(null);
    setCoinsSpent(0);
    setCoinsEarned(0);
    setShopCategory(null);
    setShopIndex(0);
    setShopConfirm(null);
    setShopError(null);
    setShopVisible(false);
    setInventoryConfirm(null);
    setSelectedIcon("none");
    setGamesVisible(false);
    setAudioIndex(0);
    setIsSleeping(false);
    setCurrentAction(null);
    setSelectedGameIndex(0);
    setNoaDead(false);
    setScreen("start");
    setBackgroundImage("/images/back-grounds/day.png");
    setMoveCommand(null);
    setStartCommand(false);
  };

  const togglePlacement = (itemId: string) => {
    const item = allItemsMap.get(itemId);
    if (!item) return;
    if (item.category !== "decoration" && item.category !== "toys") {
      setShopError("Solo puedes colocar juguetes o decoraciones en pantalla.");
      return;
    }
    setActiveItemIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      if (prev.length >= MAX_ACTIVE_ITEMS) {
        setShopError(
            `El estante solo tiene espacio para ${MAX_ACTIVE_ITEMS} articulos.`,
        );
        return prev;
      }
      setShopError(null);
      return [...prev, itemId];
    });
  };


  const handleBuy = (itemId: string) => {
    const item = allItemsMap.get(itemId);
    if (!item) {
      setShopError("No encontramos ese item.");
      setShopConfirm(null);
      return;
    }

    const isFood = item.category === "food";

    if (money < item.price) {
      setShopError(
          "No tienes suficientes coins. Juega un minijuego para conseguir mas.",
      );
      setShopConfirm(null);
      return;
    }

    if (item.category === "theme") {
      setInventory((prev) => {
        if (prev.themes.includes(item.id)) return prev;
        return { ...prev, themes: [...prev.themes, item.id] };
      });
      setActiveThemeId(item.id);
    }

    if (item.category === "decoration") {
      setInventory((prev) => {
        const already = prev.decorations.includes(item.id);
        return {
          ...prev,
          plant: prev.plant || item.id === "dec-02",
          decorations: already ? prev.decorations : [...prev.decorations, item.id],
        };
      });
    }

    if (item.category === "toys") {
      setInventory((prev) => {
        const already = prev.toys.includes(item.id);
        return {
          ...prev,
          teddy: prev.teddy || item.id === "toys-04",
          toys: already ? prev.toys : [...prev.toys, item.id],
        };
      });
    }

    if (!isFood) {
      setPurchasedItemIds((prev) =>
          prev.includes(item.id) ? prev : [...prev, item.id],
      );
    }

    if (!isFood && (item.category === "decoration" || item.category === "toys")) {
      setActiveItemIds((prev) => {
        if (prev.includes(item.id) || prev.length >= MAX_ACTIVE_ITEMS) {
          return prev;
        }
        return [...prev, item.id];
      });
    }

    setCoinsSpent((c) => {
      const total = c + item.price;
      localStorage.setItem("coinsSpent", String(total));
      return total;
    });
    setShopConfirm(null);
    setShopError(null);
    setShopCategory(null);
    setShopIndex(0);
    setShopVisible(false);
    setScreen("main");

    if (isFood) {
      feedNoa();
    }
  };

  useEffect(() => {
    if (!shopVisible) return;
    if (shopCategory === null) {
      setShopIndex((i) => Math.min(i, SHOP_MENU_OPTIONS.length));
      return;
    }
    if (shopCategory === "inventory") {
      setShopIndex((i) => Math.min(i, inventoryItems.length));
      return;
    }
    const itemsByCategory = availableShopItems.filter(
        (item) => item.category === shopCategory,
    );
    const maxIndex = itemsByCategory.length;
    setShopIndex((i) => Math.min(i, maxIndex));
  }, [shopVisible, shopCategory, availableShopItems, inventoryItems.length]);

  // 1) Cargar estado guardado
  useEffect(() => {
    const saved = localStorage.getItem("noaState");
    if (saved) {
      const parsed = JSON.parse(saved) as NoaState;
      const now = Date.now();
      const minutes = (now - parsed.lastUpdated) / 60000;
      const decay = Math.floor(minutes / 5);
      if (decay > 0) {
        parsed.hunger = Math.max(parsed.hunger - decay, 0);
        parsed.happiness = Math.max(parsed.happiness - decay, 0);
        parsed.energy = Math.max(parsed.energy - decay, 0);
      }
      setNoaState({ ...parsed, lastUpdated: now });
    }
  }, []);

  // 2) Guardar estado al cambiar
  useEffect(() => {
    localStorage.setItem("noaState", JSON.stringify(noaState));
  }, [noaState]);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem("activeItemIds", JSON.stringify(activeItemIds));
  }, [activeItemIds]);

  useEffect(() => {
    localStorage.setItem("purchasedItemIds", JSON.stringify(purchasedItemIds));
  }, [purchasedItemIds]);

  useEffect(() => {
    const filtered = purchasedItemIds.filter(
        (id) => allItemsMap.get(id)?.category !== "food",
    );
    if (filtered.length !== purchasedItemIds.length) {
      setPurchasedItemIds(filtered);
    }
  }, [purchasedItemIds, allItemsMap]);

  useEffect(() => {
    if (activeThemeId) {
      localStorage.setItem("activeThemeId", activeThemeId);
    }
  }, [activeThemeId]);

  useEffect(() => {
    localStorage.setItem("coinsSpent", String(coinsSpent));
  }, [coinsSpent]);

  useEffect(() => {
    localStorage.setItem("coinsEarned", String(coinsEarned));
  }, [coinsEarned]);

  useEffect(() => {
    if (!shopError) return;
    const id = setTimeout(() => setShopError(null), 2500);
    return () => clearTimeout(id);
  }, [shopError]);

  // 3) Decaimiento de stats cada minuto
  useEffect(() => {
    const id = setInterval(() => {
      setNoaState((prev) => ({
        ...prev,
        hunger: Math.max(prev.hunger - 1, 0),
        happiness: Math.max(prev.happiness - 1, 0),
        energy: Math.max(prev.energy - 1, 0),
        lastUpdated: Date.now(),
      }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // 5) Fondo dia/tarde/noche y forzar noche si duerme. El tema solo cambia la consola.
  useEffect(() => {
    if (isSleeping) {
      setBackgroundImage("/images/back-grounds/night.png");
      return;
    }
    const hour = time.getHours();
    if (hour >= 6 && hour < 18) {
      setBackgroundImage("/images/back-grounds/day.png");
    } else if (hour < 20) {
      setBackgroundImage("/images/back-grounds/tarde.png");
    } else {
      setBackgroundImage("/images/back-grounds/night.png");
    }
  }, [time, isSleeping]);

  // 6) Recargar energia mientras duerme
  useEffect(() => {
    let id: NodeJS.Timeout;
    if (isSleeping) {
      id = setInterval(() => {
        setNoaState((prev) => {
          const newEnergy = Math.min(prev.energy + 5, 100);
          return { ...prev, energy: newEnergy };
        });
      }, 10000);
    }
    return () => clearInterval(id);
  }, [isSleeping]);

  // 7) Despertar cuando llegue a 100 de energia
  useEffect(() => {
    if (isSleeping && noaState.energy >= 100) {
      setIsSleeping(false);
      setCurrentAction(null);
    }
  }, [noaState.energy, isSleeping]);

  const playSfx = useCallback(
      (id: string) => {
        if (!actionSoundEnabled) return;
        const el = document.getElementById(id) as HTMLAudioElement | null;
        if (el) {
          el.currentTime = 0;
          void el.play();
        }
      },
      [actionSoundEnabled],
  );

  // 9) Morir si toda las stat llegan a  0
  useEffect(() => {
    if (
        noaState.hunger === 0 &&
        noaState.happiness === 0 &&
        noaState.energy === 0
    ) {
      setNoaDead(true);
      setCurrentAction(null);
      setIsSleeping(false);
      if (screen === "catch" || screen === "space") {
        setScreen("main");
      }
      playSfx("gameover-sound");
    }
  }, [noaState.hunger, noaState.happiness, noaState.energy, screen, playSfx]);

  // Acciones basicas
  const feedNoa = () => {
    if (isSleeping || noaDead) return;
    playSfx("eating-sound");
    setCurrentAction("eating");
    setNoaState((p) => ({
      ...p,
      hunger: Math.min(p.hunger + 20, 100),
      energy: Math.min(p.energy + 10, 100),
      happiness: Math.min(p.happiness + 10, 100),
    }));
  };

  const petNoa = () => {
    if (isSleeping || noaDead) return;
    playSfx("petting-sound");
    setCurrentAction("petting");
    setNoaState((p) => ({
      ...p,
      happiness: Math.min(p.happiness + 10, 100),
      energy: Math.max(p.energy - 10, 0),
    }));
  };

  const gaming = () => {
    if (isSleeping || noaDead) return;
    if (menuOptions[selectedGameIndex]) {
      setCurrentAction("gaming");
      setNoaState((p) => ({
        ...p,
        happiness: Math.min(p.happiness + 10, 100),
        energy: Math.max(p.energy - 10, 0),
        hunger: Math.max(p.hunger - 10, 0),
      }));
    }
  };

  const handleGameEnd = useCallback(
      (score: number, newRecord: boolean) => {
        const reward = 10 + (newRecord ? 5 : 0);
        if (newRecord) {
          playSfx("win-sound");
        }
        setCoinsEarned((prev) => {
          const total = prev + reward;
          localStorage.setItem("coinsEarned", String(total));
          return total;
        });
      },
      [playSfx],
  );

  const playActionSound = () => {
    playSfx("action-sound");
  };

  const handleAButton = () => {
    if (visible) {
      playActionSound();
      if (audioIndex === 0) setVolume(Math.max(0, volume - 0.1));
      else if (audioIndex === 1) setVolume(Math.min(1, volume + 0.1));
      else if (audioIndex === 2) setVolume(0);
      else if (audioIndex === 3) setBgmEnabled((b) => !b);
      else if (audioIndex === 4) setActionSoundEnabled((b) => !b);
      return;
    }

    if (shopVisible) {
      playActionSound();
      if (inventoryConfirm) {
        confirmInventoryAction(inventoryConfirm);
        return;
      }
      if (shopConfirm) {
        handleBuy(shopConfirm);
        return;
      }

      if (shopCategory === null) {
        const isExit = shopIndex === SHOP_MENU_OPTIONS.length;
        const selectedCategory = SHOP_MENU_OPTIONS[shopIndex];
        if (isExit) {
          setShopVisible(false);
          setShopIndex(0);
          setShopError(null);
          setScreen("main");
        } else if (selectedCategory) {
          setShopCategory(selectedCategory);
          setShopIndex(0);
        }
        return;
      }

      if (shopCategory === "inventory") {
        const isBack = shopIndex === inventoryItems.length;
        if (isBack) {
          setShopCategory(null);
          setShopIndex(0);
          setShopError(null);
          return;
        }
        const selectedItem = inventoryItems[shopIndex];
        if (!selectedItem) {
          setShopError("No hay articulos en tu inventario.");
          return;
        }
        setInventoryConfirm({
          id: selectedItem.id,
          type: selectedItem.category === "theme" ? "theme" : "toggle",
        });
        return;
      }

      const itemsByCategory = availableShopItems.filter(
          (item) => item.category === shopCategory,
      );
      const isBack = shopIndex === itemsByCategory.length;
      if (isBack) {
        setShopCategory(null);
        setShopIndex(0);
        return;
      }

      const selectedItem = itemsByCategory[shopIndex];
      if (selectedItem) {
        if (money < selectedItem.price) {
          setShopError("No tienes suficientes coins. Juega un minijuego para conseguir mas.");
          setShopConfirm(null);
          return;
        }
        setShopConfirm(selectedItem.id);
        setShopError(null);
      } else {
        setShopError("No hay items disponibles en esta categoria.");
      }
      return;
    }

    if (gamesVisible) {
      playActionSound();
      startSelectedGame();
      return;
    }

    if (selectedIcon === "settings") {
      setShowSoundModal(true);
      setAudioIndex(0);
      return;
    }

    if (selectedIcon === "shop") {
      setShopVisible(true);
      setShopIndex(0);
      setShopCategory(null);
      setShopError(null);
      setShopConfirm(null);
      return;
    }
    if (selectedIcon === "games") {
      setGamesVisible(true);
      setSelectedGameIndex(0);
      return;
    }
  };

  // Limpiar accion despues de 2s (si no duerme ni esta muerto)
  useEffect(() => {
    if (currentAction && !isSleeping && !noaDead) {
      const timer = setTimeout(() => setCurrentAction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentAction, isSleeping, noaDead]);

  // D-PAD
  const handleMove = (dir: "left" | "right" | "up" | "down"): void => {
    if (noaDead) return;
    playActionSound();
    setMoveCommand(dir);
    setTimeout(() => setMoveCommand(null), 100);
  };

  // Cambiar pantalla "start" -> "main" -> "menu"
  const handleStart = () => {
    if (noaDead) return;
    if (screen === "catch" || screen === "space") {
      setStartCommand(true);
      setTimeout(() => setStartCommand(false), 100);
      return;
    }
    // Si estamos en "start" -> "main"
    if (screen === "start") {
      setScreen("main");
    }
  };

  const handleBack = () => {
    if (noaDead) return;
    playActionSound();
    if (shopVisible) {
      if (inventoryConfirm) {
        setInventoryConfirm(null);
        return;
      }
      if (shopConfirm) {
        setShopConfirm(null);
      } else if (shopCategory) {
        setShopCategory(null);
        setShopIndex(0);
        setShopError(null);
      } else {
        setShopVisible(false);
        setShopIndex(0);
        setShopError(null);
        setInventoryConfirm(null);
        setScreen("main");
      }
    } else if (visible) {
      setShowSoundModal(false);
      setAudioIndex(0);
    } else if (gamesVisible) {
      setGamesVisible(false);
    } else if (screen === "catch" || screen === "space") {
      setScreen("main");
      setGamesVisible(true);
    }
  };

  // === iniciar el minijuego seleccionado
  const startSelectedGame = () => {
    if (noaDead || isSleeping) return;
    playSfx("start-sound");
    gaming();
    setGamesVisible(false);
    setScreen(menuOptions[selectedGameIndex]);
  };

  const changeMenuSelection = (dir: "left" | "right") => {
    setSelectedGameIndex((i) =>
        dir === "left"
            ? (i - 1 + menuOptions.length) % menuOptions.length
            : (i + 1) % menuOptions.length,
    );
  };

  // Estado emocional (sirve para alertas en 8 bit)
  const getEmotional = useCallback(() => {
    const { hunger, happiness, energy } = noaState;
    if (hunger < 20) return "hungry";
    if (energy < 20) return "tired";
    if (happiness < 20) return "sad";
    return "normal";
  }, [noaState]);

  const emotion = getEmotional();

  // 10) Control de musica de fondo
  useEffect(() => {
    const normalBgm = document.getElementById("normal-bgm") as HTMLAudioElement;
    const warningBgm = document.getElementById(
        "warning-bgm",
    ) as HTMLAudioElement;

    if (!bgmEnabled) {
      normalBgm.pause();
      warningBgm.pause();
    } else if (emotion === "normal") {
      normalBgm.play();
      warningBgm.pause();
    } else {
      normalBgm.pause();
      warningBgm.play();
    }

    return () => {
      normalBgm.pause();
      warningBgm.pause();
    };
  }, [emotion, bgmEnabled]);

  // 11) Control de sonido de advertencia
  useEffect(() => {
    const warningSound = document.getElementById(
        "warning-sound",
    ) as HTMLAudioElement;

    if (emotion !== "normal") {
      warningSound.play();
    } else {
      warningSound.pause();
    }
    return () => {
      warningSound.pause();
    };
  }, [emotion]);
  // Aplicar el volumen a todos los sonidos
  useEffect(() => {
    const allSounds = [
      document.getElementById("normal-bgm") as HTMLAudioElement,
      document.getElementById("warning-bgm") as HTMLAudioElement,
      document.getElementById("warning-sound") as HTMLAudioElement,
      document.getElementById("action-sound") as HTMLAudioElement,
      document.getElementById("win-sound") as HTMLAudioElement,
      document.getElementById("gameover-sound") as HTMLAudioElement,
      document.getElementById("petting-sound") as HTMLAudioElement,
      document.getElementById("eating-sound") as HTMLAudioElement,
      document.getElementById("start-sound") as HTMLAudioElement,
    ];
    allSounds.forEach((audio) => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  useEffect(() => {
    if (!actionSoundEnabled) {
      const a = document.getElementById(
          "action-sound",
      ) as HTMLAudioElement | null;
      if (a) a.pause();
    }
  }, [actionSoundEnabled]);

  return (
      <div className="gameboy" style={gameboyStyle}>
        {/* -------------------- HEADER -------------------- */}
        <div className="gameboy-top relative">
          <img
              src="/images/logo/noa-console.png"
              alt="NOA Console"
              className="gameboy-logo mx-auto"
          />
          <audio id="warning-sound" src="/sounds/warning.mp3" />
          <audio id="normal-bgm" src="/sounds/sound-1.mp3" loop />
          <audio id="warning-bgm" src="/sounds/warning-music.mp3" loop />
          <audio id="action-sound" src="/sounds/seleccionar.mp3" />
          <audio id="win-sound" src="/sounds/win.mp3" />
          <audio id="gameover-sound" src="/sounds/game-over.mp3" />
          <audio id="petting-sound" src="/sounds/petting.mp3" />
          <audio id="eating-sound" src="/sounds/eating-sound-effect-36186.mp3" />
          <audio id="start-sound" src="/sounds/start the fame.mp3" />
        </div>

        {/* -------------------- PANTALLA -------------------- */}
        <div
            className="gameboy-screen relative overflow-hidden"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
        >
          {/* === Press Start === */}
          {screen === "start" && !noaDead && (
              <div className="gameboy-top2 flex flex-col items-center justify-end h-full">
                <p className="press-start-text animate-blink pixel-font">
                  Press Start
                </p>
              </div>
          )}

          {/* === Pantalla principal === */}
          {screen === "main" && !noaDead && (
              <>
                {/* HUD superior */}
                <div className="absolute top-1 left-1 right-1 flex flex-col items-end z-20">
                  <div className="w-full flex justify-center">
                    <StatusBars noaState={noaState} />
                  </div>
                  <div className="pixel-font text-xs text-white  ">
                    {time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Animacion de Noa segun estado */}
                <div className="relative z-10 flex flex-col items-center justify-end w-full p-2 pt-6">
                  <div className="relative flex items-end justify-center w-full h-full">
                    <div className="absolute bottom-1 left-0 right-0 flex items-end justify-center pointer-events-none">
                      <div
                          className="relative w-[250px] h-[130px] drop-shadow-lg"
                          style={{
                            backgroundImage:
                                "url(/images/back-grounds/estante-de-juguetes.png)",
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                          }}
                          aria-label="Estante de Noa"
                      >
                        {shelfItems.slice(0, SHELF_POSITIONS.length).map((item, idx) => {
                          const pos = SHELF_POSITIONS[idx];
                          return (
                              <img
                                  key={item.id}
                                  src={item.image_url}
                                  alt={item.name}
                                  className="absolute w-12 h-12 pixel-art drop-shadow"
                                  style={{ left: pos.left, top: pos.top }}
                              />
                          );
                        })}
                      </div>
                    </div>
                    {houseItem && (
                        <img
                            src={houseItem.image_url}
                            alt={houseItem.name}
                            className="absolute bottom-1 left-1 w-16 h-16 pixel-art drop-shadow pointer-events-none z-10"
                        />
                    )}
                    {isSleeping ? (
                        <div className="relative z-10 w-full h-[64px] flex items-end justify-start pl-6">
                          <NoaSleeping />
                        </div>
                    ) : currentAction === "eating" ? (
                        <div className="relative z-10 w-full h-[64px] flex items-end justify-start pl-6">
                          <NoaEating />
                        </div>
                    ) : currentAction === "petting" ? (
                        <div className="relative z-10 w-full h-[64px] flex items-end justify-start pl-6">
                          <NoaPetting />
                        </div>
                    ) : (
                        <div className="relative z-10 w-full h-[64px] flex items-end justify-start pl-6">
                          <NoaWalking />
                        </div>
                    )}
                  </div>
                </div>
                {emotion !== "normal" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-30">
                      <div
                          className="pixel-font text-red-400 text-[10px] px-2 py-1 border border-red-400 rounded animate-shake"
                          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                      >
                        {emotion === "hungry" && "!Noah tiene HAMBRE!"}
                        {emotion === "tired" && "!Noah esta CANSADO! ¡Que mejor que una siesta! "}
                        {emotion === "sad" && "!Noah está TRISTE! ¡Que mejor que un abrazo!"}
                      </div>
                    </div>
                )}
              </>
          )}

          {/* === MiniGameCatch === */}
          {screen === "catch" && !noaDead && !isSleeping && (
              <MiniGameCatch
                  onExit={handleBack}
                  moveCommand={moveCommand}
                  startCommand={startCommand}
                  onGameEnd={handleGameEnd}
                  sfxEnabled={actionSoundEnabled}
              />
          )}

          {/* === MiniGameSpace === */}
          {screen === "space" && !noaDead && !isSleeping && (
              <MiniGameSpace
                  onExit={handleBack}
                  moveCommand={moveCommand}
                  startCommand={startCommand}
                  onGameEnd={handleGameEnd}
                  sfxEnabled={actionSoundEnabled}
              />
          )}

          {/* === Game Over (Tamagotchi) === */}
          {noaDead && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white pixel-font">
                <img
                    src="/images/rip.png"
                    alt="ripNoa"
                    className="w-[200px] h-[150px] mb-2 pixel-art"
                />
                <h1 className="text-sm font-bold mb-1 pixel-font">GAME OVER</h1>
                <p className="text-xs mb-2 pixel-font">
                  Pulsa ÔÇ£RESETÔÇØ para reiniciar
                </p>
              </div>
          )}

          {/* Iconos inferiores */}
          {screen === "main" && (
              <div className="absolute bottom-2 left-2 right-2 z-20 flex flex-col items-center">
                {/* Display label when an icon is highlighted */}
                {selectedIcon !== "none" && (
                    <span className="pixel-font text-xs text-white mb-1">
                {selectedIcon === "shop"
                    ? "Tienda"
                    : selectedIcon === "games"
                        ? "Games"
                        : "Settings"}
              </span>
                )}
                <div className="flex justify-between w-full">
                  <div
                      className={`w-[25px] h-[25px] pixel-art cursor-pointer flex items-center justify-center ${
                          selectedIcon === "shop"
                              ? "animate-pulse ring-2 ring-yellow-300 animate-pixel-fill"
                              : ""
                      }`}
                      onClick={() => {
                        setShopIndex(0);
                        setShopCategory(null);
                        setShopError(null);
                        setShopConfirm(null);
                        setShopVisible(true);
                      }}
                  >
                    <img
                        src="/images/icons/tienda.png"
                        alt="Shop"
                        className="w-full h-full"
                    />
                  </div>
                  <div
                      className={`w-[25px] h-[25px] pixel-art cursor-pointer flex items-center justify-center ${
                          selectedIcon === "games"
                              ? "animate-pulse ring-2 ring-yellow-300 animate-pixel-fill"
                              : ""
                      }`}
                      onClick={() => {
                        setGamesVisible(true);
                        setSelectedGameIndex(0);
                      }}
                  >
                    <img
                        src="/images/icons/games.png"
                        alt="Games"
                        className="w-full h-full"
                    />
                  </div>
                  <div
                      className={`w-[25px] h-[25px] pixel-art cursor-pointer flex items-center justify-center ${
                          selectedIcon === "settings"
                              ? "animate-pulse ring-2 ring-yellow-300 animate-pixel-fill"
                              : ""
                      }`}
                      onClick={() => {
                        setAudioIndex(0);
                        setShowSoundModal(true);
                      }}
                  >
                    <img
                        src="/images/icons/ajustes.png"
                        alt="Config"
                        className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
          )}

          <AudioSettingsModal
              visible={visible}
              volume={volume}
              onVolumeChange={setVolume}
              onMute={() => setVolume(0)}
              bgmEnabled={bgmEnabled}
              onToggleBgm={() => setBgmEnabled((b) => !b)}
              sfxEnabled={actionSoundEnabled}
              onToggleSfx={() => setActionSoundEnabled((b) => !b)}
              selectedIndex={audioIndex}
          />
          <ShopScreen
              visible={shopVisible}
              selectedIndex={shopIndex}
              category={shopCategory}
              money={money}
              confirming={shopConfirm}
              error={shopError}
              items={availableShopItems}
              inventoryItems={inventoryItems}
              activeItemIds={activeItemIds}
              maxActiveItems={MAX_ACTIVE_ITEMS}
              onBuy={(itemId) => handleBuy(itemId)}
          />
          {inventoryConfirm && shopVisible && (() => {
            const item =
                inventoryItems.find((i) => i.id === inventoryConfirm.id) ||
                allItemsMap.get(inventoryConfirm.id);
            if (!item) return null;
            const isActive = activeItemIds.includes(item.id);
            const message =
                inventoryConfirm.type === "theme"
                    ? `¿Aplicar el tema ${item.name}?`
                    : isActive
                        ? `¿Quitar ${item.name} de pantalla y guardarlo?`
                        : `¿Mostrar ${item.name} en pantalla?`;
            return (
                <div className="absolute inset-0 bg-[#113] z-30 text-blue-200 pixel-font p-3 flex flex-col items-center justify-center border-2 border-blue-400">
                  <h2 className="text-center mb-2 text-sm">Confirmar</h2>
                  <p className="text-center text-xs mb-2">{message}</p>
                  <p className="text-[10px]">A = Si &nbsp; B = No</p>
                </div>
            );
          })()}
          <GamesModal visible={gamesVisible} selectedIndex={selectedGameIndex} />
        </div>
        {/* -------------------- CONTROLES -------------------- */}
        <div className="gameboy-controls">
          <ActionButtons
              onFeed={handleAButton}
              onPet={shopVisible || visible ? handleBack : petNoa}
              onSleep={() => {
                if (!isSleeping && !noaDead) setIsSleeping(true);
              }}
              onReset={resetGame}
              onStart={handleStart}
              onStartGame={startSelectedGame}
              onMove={(dir) => {
                if (visible) {
                  const max = 4;
                  if (dir === "left")
                    setAudioIndex((i) => (i - 1 + max + 1) % (max + 1));
                  else if (dir === "right")
                    setAudioIndex((i) => (i + 1) % (max + 1));
                } else if (shopVisible) {
                  const itemsInCategory =
                      shopCategory === "inventory"
                          ? inventoryItems
                          : shopCategory
                              ? availableShopItems.filter(
                                  (item) => item.category === shopCategory,
                              )
                              : [];
                  const max = shopCategory
                      ? itemsInCategory.length
                      : SHOP_MENU_OPTIONS.length;
                  if (dir === "up")
                    setShopIndex((i) => Math.max(0, i - 1));
                  else if (dir === "down")
                    setShopIndex((i) => Math.min(max, i + 1));
                } else if (gamesVisible) {
                  changeMenuSelection(dir === "left" ? "left" : "right");
                } else if (screen === "main") {
                  const icons = ["shop", "games", "settings"] as const;
                  if (dir === "left" || dir === "right") {
                    const currentIndex = icons.indexOf(selectedIcon as any);
                    const step = dir === "left" ? -1 : 1;
                    const nextIndex =
                        currentIndex === -1
                            ? dir === "left"
                                ? icons.length - 1
                                : 0
                            : (currentIndex + step + icons.length) % icons.length;
                    setSelectedIcon(icons[nextIndex]);
                  } else if (dir === "up") {
                    setSelectedIcon("none");
                  } else if (dir === "down" && selectedIcon === "none") {
                    setSelectedIcon("shop");
                  }
                }
                handleMove(dir);
              }}
              onBack={handleBack}
              isSleeping={isSleeping || noaDead}
              isStarting={screen === "start"}
              inMenu={gamesVisible || ["catch", "space"].includes(screen)}
          />
        </div>
      </div>
  );
}
