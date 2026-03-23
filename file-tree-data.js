// File tree structure with expandable folders
const FILE_TREE = {
    name: 'E:',
    type: 'folder',
    expanded: true,
    children: [
        {
            name: 'TEoAAAG',
            type: 'folder',
            expanded: false,
            path: 'E:\\TEoAAAG',
            children: [
                { name: 'index.html', type: 'file', size: '45KB', path: 'E:\\TEoAAAG\\index.html' },
                { name: 'TEoAAAG.exe', type: 'file', size: '8.2MB', path: 'E:\\TEoAAAG\\TEoAAAG.exe' },
                { name: 'config.json', type: 'file', size: '2.1KB', path: 'E:\\TEoAAAG\\config.json' }
            ]
        },
        {
            name: 'Tribes',
            type: 'folder',
            expanded: false,
            path: 'E:\\Tribes',
            children: [
                {
                    name: 'base',
                    type: 'folder',
                    expanded: false,
                    path: 'E:\\Tribes\\base',
                    children: [
                        { name: 'terrain.dat', type: 'file', size: '12MB', path: 'E:\\Tribes\\base\\terrain.dat' },
                        { name: 'scripts.c', type: 'file', size: '520KB', path: 'E:\\Tribes\\base\\scripts.c' }
                    ]
                },
                {
                    name: 'RPG',
                    type: 'folder',
                    expanded: false,
                    path: 'E:\\Tribes\\RPG',
                    children: [
                        { name: 'quests.dat', type: 'file', size: '4.3MB', path: 'E:\\Tribes\\RPG\\quests.dat' }
                    ]
                }
            ]
        },
        {
            name: 'dashboard-app',
            type: 'folder',
            expanded: false,
            path: 'E:\\dashboard-app',
            children: [
                { name: 'index.html', type: 'file', size: '39KB', path: 'E:\\dashboard-app\\index.html' },
                { name: 'server.js', type: 'file', size: '9.4KB', path: 'E:\\dashboard-app\\server.js' },
                { name: 'proxy.js', type: 'file', size: '2.5KB', path: 'E:\\dashboard-app\\proxy.js' }
            ]
        },
        { name: 'build.bat', type: 'file', size: '1.2KB', path: 'E:\\build.bat' },
        { name: 'dashboard.bat', type: 'file', size: '856B', path: 'E:\\dashboard.bat' }
    ]
};
