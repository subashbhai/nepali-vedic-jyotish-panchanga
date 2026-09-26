import * as THREE from 'three';

/**
 * Procedural 3D Home Appliances & Furniture Builder for Interior 3D Views
 */
export function buildInteriorAppliance(applianceId: string): THREE.Group {
  const group = new THREE.Group();

  switch (applianceId) {
    case 'sofa': {
      // 3-Seater Modern Fabric Sofa
      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 }); // Navy blue fabric
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

      // Base seat cushion
      const seat = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.0, 2.8), fabricMat);
      seat.position.set(0, 0.8, 0);
      seat.castShadow = true;
      group.add(seat);

      // Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(6.5, 2.2, 0.7), fabricMat);
      back.position.set(0, 2.0, -1.1);
      back.castShadow = true;
      group.add(back);

      // Armrests
      [-3.0, 3.0].forEach(ax => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 2.8), fabricMat);
        arm.position.set(ax, 1.4, 0);
        arm.castShadow = true;
        group.add(arm);
      });

      // Wooden coffee table in front of sofa
      const tableTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.2, 2.0), woodMat);
      tableTop.position.set(0, 1.1, 2.8);
      group.add(tableTop);
      [-1.8, 1.8].forEach(tx => {
        [-0.7, 0.7].forEach(tz => {
          const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), woodMat);
          tLeg.position.set(tx, 0.5, 2.8 + tz);
          group.add(tLeg);
        });
      });
      break;
    }

    case 'bed': {
      // King/Double Bed
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 }); // Teak finish
      const mattressMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 }); // Crisp white sheet
      const blanketMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }); // Crimson blanket

      // Bed frame plinth
      const frame = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.6, 6.8), woodMat);
      frame.position.set(0, 0.4, 0);
      frame.castShadow = true;
      group.add(frame);

      // Headboard
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.2, 0.4), woodMat);
      headboard.position.set(0, 1.8, -3.2);
      headboard.castShadow = true;
      group.add(headboard);

      // Mattress
      const mattress = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.9, 6.4), mattressMat);
      mattress.position.set(0, 1.1, 0);
      group.add(mattress);

      // Blanket folded at bottom
      const blanket = new THREE.Mesh(new THREE.BoxGeometry(5.82, 0.92, 3.5), blanketMat);
      blanket.position.set(0, 1.11, 1.4);
      group.add(blanket);

      // Pillows
      [-1.6, 1.6].forEach(px => {
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 1.4), mattressMat);
        pillow.position.set(px, 1.7, -2.2);
        pillow.rotation.x = 0.2;
        group.add(pillow);
      });
      break;
    }

    case 'tv_unit': {
      // Wall Console & Flat Screen 65" TV
      const blackMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.8 });
      const consoleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });

      // Wall-mounted screen
      const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.7, 0.15), blackMat);
      tvScreen.position.set(0, 3.2, -0.1);
      tvScreen.castShadow = true;
      group.add(tvScreen);

      // Media console below
      const consoleShelf = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.8, 1.2), consoleMat);
      consoleShelf.position.set(0, 1.2, 0.4);
      consoleShelf.castShadow = true;
      group.add(consoleShelf);
      break;
    }

    case 'dining_table': {
      // 6-Seater Dining Table & Chairs
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.4 });
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });

      // Table top
      const table = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.25, 3.4), woodMat);
      table.position.set(0, 2.4, 0);
      table.castShadow = true;
      group.add(table);

      // Table legs
      [-2.6, 2.6].forEach(lx => {
        [-1.4, 1.4].forEach(lz => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.2), woodMat);
          leg.position.set(lx, 1.2, lz);
          group.add(leg);
        });
      });

      // 4 Chairs around table
      [-1.8, 1.8].forEach(cx => {
        // Chair North
        const chairN = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), chairMat);
        chairN.position.set(cx, 1.1, -2.1);
        group.add(chairN);
        // Chair South
        const chairS = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), chairMat);
        chairS.position.set(cx, 1.1, 2.1);
        group.add(chairS);
      });
      break;
    }

    case 'stove': {
      // Modular Kitchen Countertop & Gas Stove
      const counterMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.3 }); // Black galaxy granite
      const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
      const burnerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

      // Counter cabinet
      const counter = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.6, 2.2), counterMat);
      counter.position.set(0, 1.3, 0);
      counter.castShadow = true;
      group.add(counter);

      // Gas stove top
      const stovePlate = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 1.6), steelMat);
      stovePlate.position.set(0, 2.7, 0);
      group.add(stovePlate);

      // Dual burners
      [-0.6, 0.6].forEach(bx => {
        const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 10), burnerMat);
        burner.position.set(bx, 2.8, 0);
        group.add(burner);
      });

      // Overhead Kitchen Chimney
      const chimney = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 8), steelMat);
      chimney.position.set(0, 6.0, 0);
      group.add(chimney);
      break;
    }

    case 'fridge': {
      // Metallic Double-Door Refrigerator
      const fridgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5.8, 2.4), fridgeMat);
      body.position.set(0, 2.9, 0);
      body.castShadow = true;
      group.add(body);

      // Handles
      const hUpper = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.15), handleMat);
      hUpper.position.set(1.1, 4.4, 1.25);
      group.add(hUpper);

      const hLower = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.15), handleMat);
      hLower.position.set(1.1, 2.2, 1.25);
      group.add(hLower);
      break;
    }

    case 'mandir': {
      // Sacred Wooden Pooja Mandir with Brass Diya & Bell
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.5 }); // Sheesham wood
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });

      // Mandir Plinth Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 2.0), woodMat);
      base.position.set(0, 0.6, 0);
      group.add(base);

      // Mandir Pillars
      [-1.2, 1.2].forEach(px => {
        [-0.8, 0.8].forEach(pz => {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.2, 8), woodMat);
          col.position.set(px, 2.3, pz);
          group.add(col);
        });
      });

      // Spire / Shikhar Top
      const roof = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.8, 4), woodMat);
      roof.position.set(0, 4.2, 0);
      roof.rotation.y = Math.PI / 4;
      group.add(roof);

      // Kalash / Brass dome on top
      const kalash = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), brassMat);
      kalash.position.set(0, 5.2, 0);
      group.add(kalash);

      // Brass Diya inside sanctum
      const diya = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.1, 0.15, 8), brassMat);
      diya.position.set(0, 1.3, 0);
      group.add(diya);

      // Diya Flame (Glowing yellow)
      const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xfde047 })
      );
      flame.position.set(0, 1.45, 0);
      group.add(flame);
      break;
    }

    case 'washing_machine': {
      // Front-Load Modern Washing Machine
      const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });

      const washer = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 2.2), whiteMat);
      washer.position.set(0, 1.4, 0);
      group.add(washer);

      // Round front glass portal
      const portal = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16), glassMat);
      portal.rotation.x = Math.PI / 2;
      portal.position.set(0, 1.4, 1.15);
      group.add(portal);
      break;
    }

    case 'wardrobe': {
      // 3-Door Tall Wooden Wardrobe
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9 });

      const body = new THREE.Mesh(new THREE.BoxGeometry(5.0, 7.2, 2.0), woodMat);
      body.position.set(0, 3.6, 0);
      body.castShadow = true;
      group.add(body);

      // Handles
      [-1.2, 0, 1.2].forEach(hx => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), handleMat);
        handle.position.set(hx, 3.6, 1.05);
        group.add(handle);
      });
      break;
    }

    default:
      break;
  }

  return group;
}
