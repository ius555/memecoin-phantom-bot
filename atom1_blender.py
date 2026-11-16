"""
Atom 1 — centrală nucleară PWR în secțiune, scenă realistă pentru Blender (Cycles).

Cum îl rulezi în Blender (3.6 / 4.x / 5.x):
  1. Deschide Blender  ->  tabul "Scripting"  ->  Open  ->  alege acest fișier
  2. Apasă "Run Script" (Alt+P). Se creează o scenă nouă, "Atom 1" (nu șterge nimic din ce ai).
  3. F12 = imagine, Ctrl+F12 = animația de pornire (360 de cadre, 15 secunde).

Din linia de comandă:
  blender -b -P atom1_blender.py -- --save atom1.blend --render atom1.png --frame 300
"""
import bpy, bmesh, math, sys
from mathutils import Matrix, Vector

PI = math.pi
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(name, default=None):
    return ARGS[ARGS.index(name) + 1] if name in ARGS else default

# ------------------------------------------------------------------ scenă
if bpy.app.background:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.name = "Atom 1"
else:
    scene = bpy.data.scenes.new("Atom 1")
    bpy.context.window.scene = scene
COL = scene.collection

# ------------------------------------------------------------------ materiale
def lin(h):
    def f(c):
        c /= 255
        return c / 12.92 if c <= .04045 else ((c + .055) / 1.055) ** 2.4
    return (f(h >> 16 & 255), f(h >> 8 & 255), f(h & 255), 1)

def setin(node, names, value):
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return node.inputs[n]

def material(name, color, metallic=0.0, rough=0.5, bump=0.0, bump_scale=8.0, rough_var=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    setin(p, ["Base Color"], lin(color))
    setin(p, ["Metallic"], metallic)
    setin(p, ["Roughness"], rough)
    if coat:
        setin(p, ["Coat Weight", "Clearcoat"], coat)
    if bump or rough_var:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = bump_scale
        noise.inputs["Detail"].default_value = 8
        nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
        if bump:
            b = nt.nodes.new("ShaderNodeBump")
            b.inputs["Strength"].default_value = bump
            b.inputs["Distance"].default_value = .05
            nt.links.new(noise.outputs[0], b.inputs["Height"])
            nt.links.new(b.outputs[0], p.inputs["Normal"])
        if rough_var:
            mr = nt.nodes.new("ShaderNodeMapRange")
            mr.inputs["To Min"].default_value = max(0, rough - rough_var)
            mr.inputs["To Max"].default_value = min(1, rough + rough_var)
            nt.links.new(noise.outputs[0], mr.inputs["Value"])
            nt.links.new(mr.outputs[0], p.inputs["Roughness"])
    m["bsdf"] = p.name
    return m

M_BASE = material("Soclu alb", 0xf2f3f4, rough=.45)
M_FLOOR = material("Podea", 0xdfe3e7, rough=.6)
M_CONCRETE = material("Beton", 0xb9bcbf, rough=.85, bump=.5, bump_scale=14)
M_STEEL = material("Otel", 0xc9d0d8, metallic=1, rough=.32, rough_var=.1, bump_scale=30)
M_STEEL_DK = material("Otel inchis", 0x6f7a87, metallic=1, rough=.45, rough_var=.1, bump_scale=30)
M_DARK = material("Carbura de bor", 0x1d2228, metallic=.6, rough=.4)
M_ORANGE = material("Vopsea portocalie", 0xf28c28, rough=.35, coat=.6)
M_RED = material("Teava calda", 0xc9362c, rough=.35, coat=.6)
M_BLUE = material("Teava rece", 0x2f6fd0, rough=.35, coat=.6)
M_COOL = material("Apa alimentare", 0x74aee6, rough=.35, coat=.6)
M_PIPE = material("Teava abur", 0xd7dce2, metallic=1, rough=.25)
M_BUTTON = material("Buton rosu", 0xe02b20, rough=.25, coat=1)
M_FUEL = material("Combustibil", 0x7d8fa3, metallic=.8, rough=.3)

fuel_bsdf = M_FUEL.node_tree.nodes[M_FUEL["bsdf"]]
setin(fuel_bsdf, ["Emission Color", "Emission"], lin(0x2aa6ff))
FUEL_GLOW = fuel_bsdf.inputs["Emission Strength"]
FUEL_GLOW.default_value = 0

def steam_material():
    m = bpy.data.materials.new("Abur")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    vol = nt.nodes.new("ShaderNodeVolumePrincipled")
    vol.inputs["Color"].default_value = (1, 1, 1, 1)
    vol.inputs["Anisotropy"].default_value = .5
    for n in ("Emission Color", "Emission"):          # aburul rămâne alb pe fundal alb
        if n in vol.inputs:
            vol.inputs[n].default_value = (1, 1, 1, 1)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    ln = nt.nodes.new("ShaderNodeVectorMath"); ln.operation = 'LENGTH'
    fall = nt.nodes.new("ShaderNodeMapRange")           # dens în centru, zero la margine
    fall.inputs["From Min"].default_value = .25; fall.inputs["From Max"].default_value = 1
    fall.inputs["To Min"].default_value = 1; fall.inputs["To Max"].default_value = 0
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 2.5; noise.inputs["Detail"].default_value = 6
    mul = nt.nodes.new("ShaderNodeMath"); mul.operation = 'MULTIPLY'
    amt = nt.nodes.new("ShaderNodeMath"); amt.operation = 'MULTIPLY'
    amt.inputs[1].default_value = 0                      # animat: cantitatea de abur
    nt.links.new(tc.outputs["Object"], ln.inputs[0])
    nt.links.new(ln.outputs["Value"], fall.inputs["Value"])
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(fall.outputs[0], mul.inputs[0]); nt.links.new(noise.outputs[0], mul.inputs[1])
    nt.links.new(mul.outputs[0], amt.inputs[0])
    nt.links.new(amt.outputs[0], vol.inputs["Density"])
    em = nt.nodes.new("ShaderNodeMath"); em.operation = 'MULTIPLY'
    em.inputs[1].default_value = 2.5                      # strălucește doar unde e dens
    nt.links.new(amt.outputs[0], em.inputs[0])
    nt.links.new(em.outputs[0], vol.inputs["Emission Strength"])
    nt.links.new(vol.outputs[0], out.inputs["Volume"])
    return m, amt.inputs[1]
M_STEAM, STEAM_AMOUNT = steam_material()

# ------------------------------------------------------------------ ajutoare de geometrie
def P(x, y, z):
    """Coordonate machetă (Y în sus) -> Blender (Z în sus)."""
    return Vector((x, -z, y))

def finish(name, bm, mat, loc=(0, 0, 0), rot=(0, 0, 0), smooth=True, bevel=0.0, thick=0.0):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.location, ob.rotation_euler = loc, rot
    me.materials.append(mat)
    COL.objects.link(ob)
    if thick:
        s = ob.modifiers.new("Grosime", 'SOLIDIFY'); s.thickness = thick; s.offset = 0
    if bevel:
        b = ob.modifiers.new("Muchii", 'BEVEL'); b.width = bevel; b.segments = 3
        b.limit_method = 'ANGLE'; b.angle_limit = math.radians(40)
    if smooth:
        e = ob.modifiers.new("Netezire", 'EDGE_SPLIT'); e.split_angle = math.radians(38)
    return ob

def lathe(name, profile, mat, loc, a0=0.0, sweep=2 * PI, segs=96, **kw):
    """Profil (rază, înălțime) rotit în jurul axei Z."""
    full = abs(sweep - 2 * PI) < 1e-6
    n = segs if full else int(segs * sweep / (2 * PI)) + 1
    bm = bmesh.new()
    rings = [[bm.verts.new((r * math.cos(a0 + sweep * i / (segs if full else n - 1)),
                            r * math.sin(a0 + sweep * i / (segs if full else n - 1)), h))
              for r, h in profile] for i in range(n)]
    for i in range(n if full else n - 1):
        A, B = rings[i], rings[(i + 1) % n]
        for j in range(len(profile) - 1):
            if profile[j][0] < 1e-6 and profile[j + 1][0] < 1e-6:
                continue
            quad = [A[j], B[j], B[j + 1], A[j + 1]]
            if profile[j][0] < 1e-6: quad = [A[j], B[j + 1], A[j + 1]]
            if profile[j + 1][0] < 1e-6: quad = [A[j], B[j], A[j + 1]]
            bm.faces.new(quad)
    return finish(name, bm, mat, loc, **kw)

def arc(r, cz, rz, a0, a1, n=12):
    return [(r * math.cos(a0 + (a1 - a0) * i / n), cz + rz * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]

def torus_profile(R, t, n=12):
    return [(R + t * math.cos(2 * PI * i / n), t * math.sin(2 * PI * i / n)) for i in range(n + 1)]

def cyl(name, r1, r2, depth, mat, loc, rot=(0, 0, 0), segs=48, bevel=.03):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1, radius2=r2, depth=depth)
    return finish(name, bm, mat, loc, rot, bevel=bevel)

def cyls(name, items, mat, segs=16):
    """Mai mulți cilindri verticali (x, y, z, rază, înălțime) într-un singur obiect."""
    bm = bmesh.new()
    for x, y, z, r, h in items:
        bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=r, depth=h,
                              matrix=Matrix.Translation((x, y, z)))
    return finish(name, bm, mat)

def box(name, sx, sy, sz, mat, loc, rot=(0, 0, 0), bevel=.05):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Diagonal((sx, sy, sz, 1)))
    return finish(name, bm, mat, loc, rot, smooth=False, bevel=bevel)

def pipe(name, pts, r, mat, flanges=True):
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 6
    cu.resolution_u = 16; cu.use_fill_caps = True
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = P(*p); bp.handle_left_type = bp.handle_right_type = 'AUTO'
    ob = bpy.data.objects.new(name, cu)
    cu.materials.append(mat)
    COL.objects.link(ob)
    if flanges:                                           # flanșe portocalii la capete
        for a, b in ((pts[0], pts[1]), (pts[-1], pts[-2])):
            d = (P(*b) - P(*a)).normalized()
            f = lathe(name + " flansa", torus_profile(r * 1.25, r * .45, 8), M_ORANGE, P(*a) + d * r, segs=32)
            f.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    return ob

CUT = dict(a0=0.0, sweep=1.5 * PI)      # sfertul din față (spre cameră) lipsește
CX = -6.0                               # centrul clădirii reactorului

# ------------------------------------------------------------------ soclu + podea
lathe("Podea", [(0, -1), (400, -1)], M_FLOOR, (0, 0, 0), segs=64, smooth=False)
lathe("Soclu", [(0, 0), (15.2, 0), *[(15.2 + r, z) for r, z in arc(.3, -.3, .3, PI / 2, 0, 6)], (15.5, -1)],
      M_BASE, (0, 0, 0), segs=160)

# ------------------------------------------------------------------ 1. anvelopă de beton
lathe("01 Anvelopa de beton", [(6.5, 0), (6.5, 8), *arc(6.5, 8, 6.5, 0, PI / 2, 24)],
      M_CONCRETE, P(CX, 0, 0), thick=.5, **CUT)
lathe("01 Inel de fundatie", [(7.1, 0), (7.1, .5), (6.7, .5)], M_CONCRETE, P(CX, 0, 0), **CUT)

# ------------------------------------------------------------------ 2. vasul reactorului
lathe("02 Vasul reactorului",
      [*arc(1.5, 2.5, 1.5, -PI / 2, 0), (1.5, 6), (1.8, 6), (1.8, 6.4), (1.5, 6.4), *arc(1.5, 6.4, 1.2, 0, PI / 2)],
      M_STEEL, P(CX, 0, 0), thick=.14, **CUT)
cyl("02 Suport vas", 1.1, .9, 1.2, M_STEEL_DK, P(CX, .6, 0))
lathe("02 Flansa", torus_profile(1.84, .11), M_ORANGE, P(CX, 6.2, 0), **CUT)
cyls("02 Prezoane", [(CX + 1.66 * math.cos(a), 1.66 * math.sin(a), 6.48, .07, .22)
                     for a in (i * 1.5 * PI / 20 + .12 for i in range(20))], M_STEEL_DK, segs=6)

# ------------------------------------------------------------------ 3. miez + 4. bare de control
CTRL = [(0, 0), (2, 2), (2, -2), (-2, 2), (-2, -2)]
fuel = [(CX + i * .3, j * .3, 3.6, .085, 2.6) for i in range(-3, 4) for j in range(-3, 4)
        if math.hypot(i, j) * .3 <= 1.1 and (i, j) not in CTRL]
cyls("03 Miez - bare de combustibil", fuel, M_FUEL)
cyls("03 Placa suport miez", [(CX, 0, 2.25, 1.2, .1)], M_STEEL_DK, segs=32)
rods = cyls("04 Bare de control",
            [(i * .3, j * .3, 3.6, .1, 2.6) for i, j in CTRL] + [(0, 0, 4.95, .95, .08), (0, 0, 6.2, .12, 2.5)], M_DARK)
rods.location = P(CX, 0, 0)

glow = bpy.data.lights.new("Lumina Cerenkov", 'POINT')
glow.color = (.15, .55, 1); glow.energy = 0; glow.shadow_soft_size = .8
glow_ob = bpy.data.objects.new("Lumina Cerenkov", glow)
glow_ob.location = P(CX + 1.6, 4, 1.6)
COL.objects.link(glow_ob)

# ------------------------------------------------------------------ 5. presurizor
lathe("05 Presurizor", [*arc(.8, 3.8, .8, -PI / 2, 0), *arc(.8, 7.2, .8, 0, PI / 2)], M_STEEL, P(CX - 2.2, 0, -2.6))
cyl("05 Suport presurizor", .7, .5, 3, M_STEEL_DK, P(CX - 2.2, 1.5, -2.6))
pipe("05 Linie de egalizare", [(CX - 2.2, 3.1, -2.6), (CX - 2.4, 2.7, -1.2), (CX - 2.2, 4, .2), (CX - 2, 5, .6)],
     .12, M_RED, flanges=False)

# ------------------------------------------------------------------ 6. generator de abur
lathe("06 Generator de abur",
      [(0, .6), (1.1, .6), (1.1, 6), (1.5, 6.9), (1.5, 9.6), *arc(1.5, 9.6, 1.4, 0, PI / 2)], M_STEEL, P(CX - 3.8, 0, 1))
cyl("06 Suport generator de abur", 1.25, 1.0, .6, M_STEEL_DK, P(CX - 3.8, .3, 1))
for h in (6.9, 3.2):
    lathe("06 Inel", torus_profile(1.54 if h > 6 else 1.13, .1), M_ORANGE, P(CX - 3.8, h, 1))

# ------------------------------------------------------------------ 7. pompă + circuit primar
cyl("07 Pompa", .65, .65, 1.6, M_STEEL_DK, P(CX - .8, .8, 3.6))
cyl("07 Motor pompa", .42, .42, 1.1, M_ORANGE, P(CX - .8, 2.15, 3.6))
pipe("07 Ramura calda", [(CX - 1.45, 5.2, .4), (CX - 2.1, 5.2, .65), (CX - 2.75, 4.8, .9)], .26, M_RED)
pipe("07 Ramura rece", [(CX - 3.5, 1.6, 2.1), (CX - 2.6, 1, 3.4), (CX - .8, 1, 3.6), (CX + .2, 1.4, 2.8),
                        (CX - .5, 2.8, 1.42)], .26, M_BLUE)
pipe("Conducta de abur", [(CX - 3.8, 10.9, 1), (CX - 2.5, 12.3, .6), (CX + 3, 11, -1.6), (.8, 6.5, -3), (4, 4.2, -3)],
     .24, M_PIPE)
pipe("Apa de alimentare", [(3.6, .7, 1.6), (0, .5, 4.2), (CX + 1, .5, 5.6), (CX - 2.6, .6, 4.2), (CX - 3.6, 1.8, 2.2)],
     .2, M_COOL)

# ------------------------------------------------------------------ 8. turbină
TX, TY, TZ = 5.6, 2.6, -3.0
lathe("08 Carcasa turbinei", [(1.55, -2.1), (1.9, -2.1), (1.9, 2.1), (1.55, 2.1)], M_STEEL, P(TX, TY, TZ),
      a0=-PI / 2, sweep=PI, rot=(0, PI / 2, 0), thick=.1)
for dx in (-1.6, 1.6):
    box("08 Suport turbina", .4, 2.6, .8, M_STEEL_DK, P(TX + dx, .4, TZ))
bm = bmesh.new()
RY = Matrix.Rotation(PI / 2, 4, 'Y')
bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=.22, radius2=.22, depth=6.2,
                      matrix=Matrix.Translation((.9, 0, 0)) @ RY)
for sx, r in ((-1.3, 1.0), (0, 1.35), (1.3, 1.7)):
    bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=.42, radius2=.42, depth=.3,
                          matrix=Matrix.Translation((sx, 0, 0)) @ RY)
    for k in range(12):
        bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Rotation(k * PI / 6, 4, 'X')
                              @ Matrix.Translation((sx, 0, r / 2 + .3)) @ Matrix.Rotation(.5, 4, 'Z')
                              @ Matrix.Diagonal((.09, .34, r, 1)))
rotor = finish("08 Rotor turbina", bm, M_ORANGE, P(TX, TY, TZ), smooth=False)

# ------------------------------------------------------------------ 9. generator electric
cyl("09 Generator electric", 1.5, 1.5, 3.6, M_STEEL, P(11, TY, TZ), rot=(0, PI / 2, 0), bevel=.12)
for x in (9.8, 12.2):
    lathe("09 Inel", torus_profile(1.53, .12), M_ORANGE, P(x, TY, TZ), rot=(0, PI / 2, 0))
box("09 Soclu generator", 3.6, 2.6, 1.2, M_STEEL_DK, P(11, .6, TZ))
box("09 Cutie de borne", 1.2, .9, .5, M_STEEL_DK, P(11, TY + 1.6, TZ))

# ------------------------------------------------------------------ 10. condensator + turn de răcire
box("10 Condensator", 4, 2.4, 1.8, M_STEEL, P(5.5, .9, 1.2), bevel=.12)
pipe("10 Evacuare abur", [(6.8, 1.2, -2), (6.4, 2.2, -.8), (5.8, 1.8, .3)], .24, M_PIPE)
pipe("10 Apa de racire", [(7.5, .6, 1.2), (8.5, .5, -.5), (8.4, .5, -5), (7.8, .7, -6.6)], .2, M_BLUE)
lathe("10 Turn de racire", [(2.6, 0), (2.25, .8), (1.95, 1.6), (1.72, 2.4), (1.57, 3.2), (1.5, 4), (1.55, 4.7),
                            (1.68, 5.4), (1.9, 6)], M_CONCRETE, P(7.5, 0, -9), thick=.14)
for i, (dx, dz, h, s) in enumerate(((0, 0, 6.3, 1.5), (.4, -.2, 7.7, 1.9), (-.3, .3, 9.3, 2.3), (.5, .2, 11, 2.6))):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=3, radius=1)
    finish("10 Abur", bm, M_STEAM, P(7.5 + dx, h, -9 + dz)).scale = (s, s, s * 1.15)

# ------------------------------------------------------------------ 11. pupitru de comandă
box("11 Pupitru de comanda", 2.2, 1.1, 1.1, M_STEEL_DK, P(6, .55, 7))
box("11 Panou", 2.2, 1.15, .12, M_DARK, P(6, 1.2, 7), rot=(.3, 0, 0), bevel=.03)
cyl("11 Buton rosu", .22, .22, .22, M_BUTTON, P(6, 1.38, 7.05), rot=(.3, 0, 0), segs=24, bevel=.04)

# ------------------------------------------------------------------ animația de pornire (ca în pagina web)
scene.render.fps = 24
scene.frame_start, scene.frame_end = 1, 360
F0, F1, F2 = 24, 264, 360                    # barele urcă în 10 secunde (cadrele 24 -> 264)
def key(owner, path, pairs, index=-1):
    for frame, value in pairs:
        if index >= 0:
            getattr(owner, path)[index] = value
        else:
            setattr(owner, path, value)
        owner.keyframe_insert(path, index=index, frame=frame)
key(rods, "location", [(1, 0), (F0, 0), (F1, 2.5)], index=2)
key(FUEL_GLOW, "default_value", [(1, 0), (F0, 0), (F1, 4)])
key(glow, "energy", [(1, 0), (F0, 0), (F1, 500)])
key(STEAM_AMOUNT, "default_value", [(1, 0), (F0 + 60, 0), (F2, .3)])
W = 2 * PI * 2 / 24                           # viteza finală a turbinei: 2 rotații pe secundă
key(rotor, "rotation_euler", [(1, 0), (F0, 0), (F1, W * (F1 - F0) / 2), (F2, W * (F1 - F0) / 2 + W * (F2 - F1))], index=0)

# ------------------------------------------------------------------ lumină, cameră, render
world = bpy.data.worlds.new("Studio alb")
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (1, 1, 1, 1)
bg.inputs["Strength"].default_value = .7
scene.world = world

sun = bpy.data.lights.new("Soare", 'SUN')
sun.energy = 2.6; sun.angle = math.radians(12)
sun_ob = bpy.data.objects.new("Soare", sun)
sun_ob.rotation_euler = (math.radians(52), 0, math.radians(38))
COL.objects.link(sun_ob)

target = bpy.data.objects.new("Tinta camerei", None)
target.location = P(-.5, 5.6, 0)
COL.objects.link(target)
cam = bpy.data.cameras.new("Camera")
cam.lens = 50
cam_ob = bpy.data.objects.new("Camera", cam)
cam_ob.location = target.location + Vector((.62, -1, .5)).normalized() * 56
track = cam_ob.constraints.new('TRACK_TO')
track.target = target; track.track_axis = 'TRACK_NEGATIVE_Z'; track.up_axis = 'UP_Y'
COL.objects.link(cam_ob)
scene.camera = cam_ob

scene.render.resolution_x, scene.render.resolution_y = 1920, 1080
try:
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = int(arg("--samples", 160))
    scene.cycles.use_denoising = True
    scene.cycles.volume_step_rate = 2
except Exception:
    for e in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE'):
        try:
            scene.render.engine = e
            break
        except Exception:
            pass
try:
    scene.view_settings.view_transform = 'Standard'
except Exception:
    pass
scene.frame_set(int(arg("--frame", 300)))

if arg("--save"):
    bpy.ops.wm.save_as_mainfile(filepath=arg("--save"))
if arg("--render"):
    scene.render.resolution_percentage = int(arg("--percent", 100))
    scene.render.filepath = arg("--render")
    bpy.ops.render.render(write_still=True, scene=scene.name)
