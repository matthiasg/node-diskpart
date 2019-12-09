const diskpart = require('..')
const test = require('tape')

test('Execute command', async (t) => {
  t.plan(1)

  const output = await diskpart.run('list volume')
  t.ok(output.length > 0)
})

test('Parse volume output', (t) => {
  t.plan(1)

  const lines = [ '',
  'Microsoft DiskPart version 10.0.18362.1',
  '',
  'Copyright (C) Microsoft Corporation.',
  'On computer: DEV10',
  '',
  'Volume ###  Ltr  Label        Fs     Type        Size     Status     Info',
  '----------  ---  -----------  -----  ----------  -------  ---------  --------',
  'Volume 0     G   2019.12.06_  UDF    DVD-ROM     2544 KB  Healthy',
  'Volume 1     C   Windows 8    NTFS   Partition    930 GB  Healthy    System',
  'Volume 2         PortableBas  NTFS   Partition   8189 MB  Healthy',
  'C:\\ProgramData\\Microsoft\\Windows\\Containers\\BaseImages\\7ca57b2e-a40b-4c96-9df0-4c60ea29ba92\\BaseLayer\\',
  '',
  'Leaving DiskPart...',
  '' ]

  const volumes = diskpart.parseVolumes(lines)
  t.ok(volumes.length > 0)
})

test('List volumes', async (t) => {
  t.plan(5)

  const volumes = await diskpart.listVolumes()

  for (const v of volumes) {
    console.log(v)
    if (v.Ltr === 'C') {
      t.pass('Found C')
      t.ok('No' in v)
      t.ok(parseInt())
      t.ok(v.Line.Includes('NTFS'))
      t.ok(v.Line.Includes('Healthy'))
    }
  }
})
