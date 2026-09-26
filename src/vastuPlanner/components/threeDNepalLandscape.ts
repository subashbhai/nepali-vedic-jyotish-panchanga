import * as THREE from 'three';

export type NepalEnvironmentType = 'pahad' | 'terai' | 'city' | 'village';

/**
 * Builds dynamic 3D surrounding landscape matching Nepal's natural environment:
 * - 'pahad': Snow-capped Himalayan mountain peaks, rolling terraced hills, pine trees
 * - 'terai': Wide flat agricultural plains, lush banana & palm groves, warm golden horizon
 * - 'city': Kathmandu urban skyline with neighboring buildings, utility poles and asphalt road
 * - 'village': Rustic Nepali village with terraced fields, haystack (परालको कुन्यु), bamboo groves
 */
export function buildNepalLandscape(
  env: NepalEnvironmentType,
  plotW: number,
  plotH: number,
  isNight: boolean
): THREE.Group {
  const envGroup = new THREE.Group();
  const radius = Math.max(160, Math.max(plotW, plotH) * 2.8);

  if (env === 'pahad') {
    // 1. Distant Himalayan Snow Peaks (मनास्लु / अन्नपूर्ण / सगरमाथा हिमशृङ्खला)
    const himalGroup = new THREE.Group();
    const peakConfigs = [
      { x: -180, z: -260, h: 140, w: 120 },
      { x: -60, z: -290, h: 180, w: 140 }, // Main majestic summit
      { x: 70, z: -270, h: 155, w: 130 },
      { x: 190, z: -250, h: 135, w: 110 }
    ];

    const snowMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0x94a3b8 : 0xffffff,
      roughness: 0.85,
      metalness: 0.1
    });

    const rockMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0x1e293b : 0x475569,
      roughness: 0.95
    });

    peakConfigs.forEach(pk => {
      // Rock base of mountain
      const peakGeo = new THREE.ConeGeometry(pk.w / 2, pk.h, 6);
      const rockMesh = new THREE.Mesh(peakGeo, rockMat);
      rockMesh.position.set(pk.x, pk.h / 2 - 10, pk.z);
      himalGroup.add(rockMesh);

      // White snow cap covering top 45% of peak
      const snowGeo = new THREE.ConeGeometry((pk.w / 2) * 0.48, pk.h * 0.45, 6);
      const snowMesh = new THREE.Mesh(snowGeo, snowMat);
      snowMesh.position.set(pk.x, pk.h - (pk.h * 0.45) / 2 - 10, pk.z);
      himalGroup.add(snowMesh);
    });
    envGroup.add(himalGroup);

    // 2. Rolling Middle Hills (काठमाडौं/पोखरा उपत्यकाका हरिया डाँडाकाँडा)
    const hillMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0x0f2b1d : 0x2d6a4f,
      roughness: 0.9
    });
    const hillPositions = [
      { x: -160, z: -120, r: 85, h: 45 },
      { x: 170, z: -110, r: 90, h: 50 },
      { x: -180, z: 80, r: 80, h: 40 },
      { x: 180, z: 90, r: 85, h: 42 }
    ];
    hillPositions.forEach(hp => {
      const hillGeo = new THREE.SphereGeometry(hp.r, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.scale.set(1, hp.h / hp.r, 1);
      hill.position.set(hp.x, -5, hp.z);
      envGroup.add(hill);
    });

    // 3. Mountain Pine Trees (सल्लाका रुखहरू)
    const pineMat = new THREE.MeshStandardMaterial({ color: isNight ? 0x064e3b : 0x14532d, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const dist = radius * (0.85 + (i % 3) * 0.1);
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      const pGroup = new THREE.Group();
      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 10, 6), trunkMat);
      trunk.position.y = 5;
      pGroup.add(trunk);
      // Pine cones tiers
      [0, 4, 8].forEach((offsetY, tier) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(5 - tier * 1.1, 7, 7), pineMat);
        cone.position.y = 10 + offsetY;
        pGroup.add(cone);
      });
      pGroup.position.set(px, 0, pz);
      envGroup.add(pGroup);
    }
  } else if (env === 'terai') {
    // 1. Vast Agricultural Plains (तराईको हरियो धान/गहुँ खेत)
    const fieldGeo = new THREE.PlaneGeometry(600, 600, 4, 4);
    const fieldMat = new THREE.MeshStandardMaterial({
      color: isNight ? 0x064e3b : 0x4ade80,
      roughness: 0.85
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.rotation.x = -Math.PI / 2;
    field.position.y = -0.3;
    field.receiveShadow = true;
    envGroup.add(field);

    // 2. Banana & Palm Groves (तराईका केरा र ताडका रुखहरू)
    const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const palmTrunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f });

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = radius * (0.75 + (i % 4) * 0.08);
      const px = Math.cos(angle) * dist;
      const pz = Math.sin(angle) * dist;

      const palmGroup = new THREE.Group();
      // Curved tall trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 22, 8), palmTrunkMat);
      trunk.position.y = 11;
      palmGroup.add(trunk);

      // Palm fronds
      for (let f = 0; f < 7; f++) {
        const fAngle = (f / 7) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.ConeGeometry(3.5, 9, 5), palmLeafMat);
        frond.rotation.z = 1.1;
        frond.rotation.y = fAngle;
        frond.position.set(0, 22, 0);
        palmGroup.add(frond);
      }
      palmGroup.position.set(px, 0, pz);
      envGroup.add(palmGroup);
    }
  } else if (env === 'city') {
    // 1. Kathmandu / Urban Skyline with neighboring residential buildings
    const buildingColors = [0xe2e8f0, 0xfbcfe8, 0xfef08a, 0xbae6fd, 0xdcfce7, 0xf87171];
    const bldgConfigs = [
      { x: -plotW - 25, z: 0, w: 28, d: 32, h: 36 },
      { x: plotW + 25, z: 0, w: 30, d: 34, h: 42 },
      { x: -plotW - 20, z: -plotH - 20, w: 26, d: 28, h: 32 },
      { x: plotW + 20, z: -plotH - 20, w: 28, d: 30, h: 38 },
      { x: 0, z: -plotH - 45, w: 42, d: 28, h: 44 }
    ];

    bldgConfigs.forEach((cfg, idx) => {
      const bMat = new THREE.MeshStandardMaterial({
        color: buildingColors[idx % buildingColors.length],
        roughness: 0.8
      });
      const bGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(cfg.x, cfg.h / 2, cfg.z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      envGroup.add(bMesh);

      // Window stripes
      const winMat = new THREE.MeshStandardMaterial({
        color: isNight ? 0xfef08a : 0x38bdf8,
        roughness: 0.2
      });
      const floors = Math.floor(cfg.h / 9);
      for (let fl = 1; fl < floors; fl++) {
        const band = new THREE.Mesh(new THREE.BoxGeometry(cfg.w + 0.2, 2.2, cfg.d + 0.2), winMat);
        band.position.set(cfg.x, fl * 9, cfg.z);
        envGroup.add(band);
      }
    });

    // 2. Concrete utility pole (बिजुलीको पोल)
    const poleGeo = new THREE.CylinderGeometry(0.35, 0.45, 24, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(-plotW / 2 - 8, 12, plotH / 2 + 14);
    envGroup.add(pole);

    // Cross arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 0.3), poleMat);
    arm.position.set(-plotW / 2 - 8, 23, plotH / 2 + 14);
    envGroup.add(arm);
  } else {
    // 'village' (गाउँले मौलिक परिवेश)
    // 1. Terraced Rice Fields (खेतका गराहरू)
    const terraceMat1 = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 });
    const terraceMat2 = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });
    for (let t = 1; t <= 4; t++) {
      const tGeo = new THREE.RingGeometry(radius * 0.4 + t * 16, radius * 0.4 + (t + 1) * 16, 24);
      const tMesh = new THREE.Mesh(tGeo, t % 2 === 0 ? terraceMat1 : terraceMat2);
      tMesh.rotation.x = -Math.PI / 2;
      tMesh.position.y = -t * 0.8;
      envGroup.add(tMesh);
    }

    // 2. Authentic Straw Haystack (परालको कुन्यु / Nepali Kunyu)
    const kunyuGroup = new THREE.Group();
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 }); // Golden straw
    // Pole in center of haystack
    const kPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 16, 6),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    kPole.position.y = 8;
    kunyuGroup.add(kPole);

    // Cone body of straw
    const kBody = new THREE.Mesh(new THREE.ConeGeometry(5.5, 12, 12), strawMat);
    kBody.position.y = 6.5;
    kunyuGroup.add(kBody);

    kunyuGroup.position.set(plotW / 2 + 14, 0, -plotH / 3);
    envGroup.add(kunyuGroup);

    // 3. Bamboo Cluster (बाँसको झ्याङ)
    const bambooStemMat = new THREE.MeshStandardMaterial({ color: 0x84cc16 });
    const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f });
    const bGroup = new THREE.Group();
    for (let b = 0; b < 10; b++) {
      const bx = (Math.random() - 0.5) * 6;
      const bz = (Math.random() - 0.5) * 6;
      const bStem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 18, 6), bambooStemMat);
      bStem.position.set(bx, 9, bz);
      bStem.rotation.z = (Math.random() - 0.5) * 0.15;
      bGroup.add(bStem);

      const bFoliage = new THREE.Mesh(new THREE.SphereGeometry(1.8, 6, 6), bambooLeafMat);
      bFoliage.position.set(bx, 17, bz);
      bGroup.add(bFoliage);
    }
    bGroup.position.set(-plotW / 2 - 16, 0, -plotH / 4);
    envGroup.add(bGroup);
  }

  return envGroup;
}
