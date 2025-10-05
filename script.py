import json
import os
import shutil

# items to stay in markdown format
overrides = ["Guia", "Extra", "Coquetéis"]

# items to not be added to the routes json
skips = ["Página principal"]

# get path of the script
path = os.path.abspath(__file__)[:(len(os.path.abspath(__file__))) - (os.path.abspath(__file__)[::-1].index("\\"))]

# list of "routes" that javascript will use to find files
routes = []

# recipe class for easier building of an object
class recipe:
    title: str
    description: list
    amount: str
    time: str
    difficulty: str
    custom: bool
    ingredients: list
    special: str
    steps: list

    def __init__(self):
        self.title = ""
        self.description = []
        self.amount = ""
        self.time = ""
        self.difficulty = ""
        self.custom = False
        self.ingredients = []
        self.special = ""
        self.steps = []

def translateRecipe(name, lines):
    obj = recipe()
    obj.title = name
    index = 0
    itemsDone = False

    # find middle point, right after ingredients list but before steps
    for line in lines:
        x = line.strip()
        if len(x) != 0:
            if x[-1] == "-":
                index = lines.index(line)
    
    for line in lines:
        if line.strip() == "":
            continue

        elif line.strip()[-1] == "-":
            itemsDone = True

        elif obj.difficulty == "":
            obj.difficulty = "easy" if line[0] == "F" else ("medium" if line[0] == "M" else "hard")

        elif obj.amount == "":
            obj.amount = line.split(" cerca de ")[-1].split("Faz ")[-1].strip()

        elif obj.time == "":
            obj.time = line.split("Demora ")[-1].strip()

        elif len(line.split("Equipamento especial: ")) > 1:
            obj.special = line.split("Equipamento especial: ")[-1].strip()

        elif line[0] != "-" and len(line.split("Equipamento especial: ")) < 2 and lines.index(line) < index and itemsDone == False:
            obj.custom = True
            x = {
                "title": "",
                "items": []
            }
            x["title"] = line.strip()
            obj.ingredients.append(x)
        elif line[0] == "-" and line.strip()[-1] != "-" and itemsDone == False:
            if obj.custom == True:
                obj.ingredients[-1]["items"].append(line.strip()[2:].strip())
            else:
                obj.ingredients.append(line.strip()[2:].strip())
        
        elif line.strip()[0] in "123456789":
            temp = ' '.join(line.strip().split(" ")[1:]).strip()
            obj.steps.append(temp)

        else:
            obj.description.append(line.strip())

    return json.dumps(obj.__dict__, ensure_ascii=False)

def prepareRecipe(file, file_path):
    # get the destiny path and remove the ordered numbers
    new_path = f"{path}data\\{"\\".join(file_path)}\\"
    split_path = new_path.split("\\")
    for i in range(len(split_path)):
        split_path[i] = split_path[i].split(" - ")[-1]
    new_path = "\\".join(split_path)

    # get the file name and remove the ordered numbers
    name = file.split("\\")[-1].split(".")[0]
    name = name.split(" - ")[-1]
    
    if not os.path.exists(new_path):
        os.makedirs(new_path)
    x = open(file, encoding="utf-8")

    markdownfile = False
    for i in overrides:
        if i in file_path or i in name:
            markdownfile = True
            break
    
    if markdownfile:
        f = open(f"{new_path}{name}.md", "w", encoding="utf-8")
        f.write("".join(x.readlines()))
    else:
        f = open(f"{new_path}{name}.json", "w", encoding="utf-8")
        f.write(translateRecipe(name, x.readlines()))
    
    x.close()
    f.close()
    routePath = file_path.copy()
    routePath.append(name)

def routeSetup(path):
    name = f'{os.path.basename(path).split(" - ")[1] if len(os.path.basename(path).split(" - ")) > 1 else os.path.basename(path)}'
    d = {name: []}

    # if path is a directory, add it as an object and look inside the directory for more things
    # if path is a file, add it to the routes json, unless it is part of the "skips" array, then return False
    if os.path.isdir(path):
        for i in os.listdir(path):
            temp = routeSetup(f'{path}\\{i}')
            if temp != False:
                d[name].append(temp)
    else:
        for i in skips:
            if i in os.path.basename(path.split('.')[0].split(" - ")[-1]):
                return False
            else:
                return os.path.basename(path.split('.')[0].split(" - ")[-1])

    return d

def recursiveSearch(search_path, paths):
    for item in os.listdir(search_path):
        item_name = item
        if len(item.split(".")) > 1:
            prepareRecipe(f"{search_path}\\{item}", paths)
        else:
            new_path = paths.copy()
            new_path.append(item_name)
            recursiveSearch(f"{search_path}\\{item}\\", new_path)

if os.path.exists(f"{path}\\data"):
        shutil.rmtree(f"{path}\\data")

for section in os.listdir(f"{path}\\input"):
    if len(section.split(".")) > 1 or section == "result": continue
    
    recursiveSearch(f"{path}\\input\\{section}\\", [section])
    temp = routeSetup(f"{path}\\input\\{section}")
    routes.append(temp)

routespath = f"{path}\\assets"
if not os.path.exists(routespath):
        os.makedirs(routespath)
f = open(f"{routespath}\\routes.json", "w", encoding="utf-8")
f.write(json.dumps(routes, ensure_ascii=False))
f.close()