import type { FamilyData } from '../../types/family';

const now = Date.now();

function mid(id: string): string {
  return `m_sample_${id}`;
}

function rid(id: string): string {
  return `r_sample_${id}`;
}

export const sampleFamilyData: FamilyData = {
  members: [
    { id: mid('1'), name: '李开山', gender: 'male', branch: '始祖', generation: 1, birthDate: '1900-05-10', deathDate: '1975-08-20', note: '家族始祖，育有四子', createdAt: now, updatedAt: now },
    { id: mid('2'), name: '王秀兰', gender: 'female', branch: '始祖', generation: 1, birthDate: '1905-03-15', deathDate: '1980-12-10', note: '李开山之妻', createdAt: now, updatedAt: now },

    { id: mid('3'), name: '李建国', gender: 'male', branch: '长房', generation: 2, birthDate: '1928-07-01', deathDate: '2005-03-15', note: '长子，长房', createdAt: now, updatedAt: now },
    { id: mid('4'), name: '张桂英', gender: 'female', branch: '长房', generation: 2, birthDate: '1930-09-20', deathDate: '2010-11-05', note: '李建国之妻', createdAt: now, updatedAt: now },
    { id: mid('5'), name: '李建华', gender: 'male', branch: '二房', generation: 2, birthDate: '1932-02-14', deathDate: '2015-06-20', note: '次子，二房', createdAt: now, updatedAt: now },
    { id: mid('6'), name: '刘美华', gender: 'female', branch: '二房', generation: 2, birthDate: '1935-08-10', deathDate: '2018-09-12', note: '李建华之妻', createdAt: now, updatedAt: now },
    { id: mid('7'), name: '李建民', gender: 'male', branch: '三房', generation: 2, birthDate: '1938-11-25', deathDate: '2020-01-08', note: '三子，三房', createdAt: now, updatedAt: now },
    { id: mid('8'), name: '陈玉琴', gender: 'female', branch: '三房', generation: 2, birthDate: '1940-04-18', note: '李建民之妻', createdAt: now, updatedAt: now },
    { id: mid('9'), name: '李建强', gender: 'male', branch: '四房', generation: 2, birthDate: '1945-06-30', note: '四子，四房', createdAt: now, updatedAt: now },
    { id: mid('10'), name: '赵丽娟', gender: 'female', branch: '四房', generation: 2, birthDate: '1948-12-05', note: '李建强之妻', createdAt: now, updatedAt: now },

    { id: mid('11'), name: '李文博', gender: 'male', branch: '长房', generation: 3, birthDate: '1955-10-12', note: '李建国长子', createdAt: now, updatedAt: now },
    { id: mid('12'), name: '孙雅婷', gender: 'female', branch: '长房', generation: 3, birthDate: '1957-08-23', note: '李文博之妻', createdAt: now, updatedAt: now },
    { id: mid('13'), name: '李文静', gender: 'female', branch: '长房', generation: 3, birthDate: '1960-04-15', note: '李建国之女', createdAt: now, updatedAt: now },
    { id: mid('14'), name: '李文涛', gender: 'male', branch: '长房', generation: 3, birthDate: '1965-12-08', note: '李建国次子', createdAt: now, updatedAt: now },
    { id: mid('15'), name: '周晓彤', gender: 'female', branch: '长房', generation: 3, birthDate: '1968-06-20', note: '李文涛之妻', createdAt: now, updatedAt: now },

    { id: mid('16'), name: '李文明', gender: 'male', branch: '二房', generation: 3, birthDate: '1958-03-25', note: '李建华长子', createdAt: now, updatedAt: now },
    { id: mid('17'), name: '吴丽娜', gender: 'female', branch: '二房', generation: 3, birthDate: '1960-11-10', note: '李文明之妻', createdAt: now, updatedAt: now },
    { id: mid('18'), name: '李文慧', gender: 'female', branch: '二房', generation: 3, birthDate: '1963-07-30', note: '李建华之女', createdAt: now, updatedAt: now },

    { id: mid('19'), name: '李武', gender: 'male', branch: '三房', generation: 3, birthDate: '1963-05-05', note: '李建民长子', createdAt: now, updatedAt: now },
    { id: mid('20'), name: '郑小芳', gender: 'female', branch: '三房', generation: 3, birthDate: '1965-09-18', note: '李武之妻', createdAt: now, updatedAt: now },
    { id: mid('21'), name: '李文君', gender: 'female', branch: '三房', generation: 3, birthDate: '1970-02-28', note: '李建民之女', createdAt: now, updatedAt: now },

    { id: mid('22'), name: '李文轩', gender: 'male', branch: '四房', generation: 3, birthDate: '1972-08-15', note: '李建强长子', createdAt: now, updatedAt: now },
    { id: mid('23'), name: '马晓燕', gender: 'female', branch: '四房', generation: 3, birthDate: '1975-04-08', note: '李文轩之妻', createdAt: now, updatedAt: now },
    { id: mid('24'), name: '李文瑜', gender: 'female', branch: '四房', generation: 3, birthDate: '1978-11-20', note: '李建强之女', createdAt: now, updatedAt: now },

    { id: mid('25'), name: '李思远', gender: 'male', branch: '长房', generation: 4, birthDate: '1985-06-10', note: '李文博之子', createdAt: now, updatedAt: now },
    { id: mid('26'), name: '林雨晴', gender: 'female', branch: '长房', generation: 4, birthDate: '1987-03-25', note: '李思远之妻', createdAt: now, updatedAt: now },
    { id: mid('27'), name: '李思琪', gender: 'female', branch: '长房', generation: 4, birthDate: '1988-12-15', note: '李文博之女', createdAt: now, updatedAt: now },
    { id: mid('28'), name: '李思源', gender: 'male', branch: '长房', generation: 4, birthDate: '1992-08-30', note: '李文涛之子', createdAt: now, updatedAt: now },

    { id: mid('29'), name: '李思诚', gender: 'male', branch: '二房', generation: 4, birthDate: '1988-04-18', note: '李文明之子', createdAt: now, updatedAt: now },
    { id: mid('30'), name: '李思语', gender: 'female', branch: '二房', generation: 4, birthDate: '1995-10-22', note: '李文明之女', createdAt: now, updatedAt: now },

    { id: mid('31'), name: '李浩然', gender: 'male', branch: '三房', generation: 4, birthDate: '1990-07-12', note: '李武之子', createdAt: now, updatedAt: now },
    { id: mid('32'), name: '黄诗涵', gender: 'female', branch: '三房', generation: 4, birthDate: '1993-02-28', note: '李浩然之妻', createdAt: now, updatedAt: now },
    { id: mid('33'), name: '李欣然', gender: 'female', branch: '三房', generation: 4, birthDate: '1998-05-15', note: '李武之女', createdAt: now, updatedAt: now },

    { id: mid('34'), name: '李子轩', gender: 'male', branch: '四房', generation: 4, birthDate: '2000-11-08', note: '李文轩之子', createdAt: now, updatedAt: now },
    { id: mid('35'), name: '李子涵', gender: 'female', branch: '四房', generation: 4, birthDate: '2003-06-20', note: '李文轩之女', createdAt: now, updatedAt: now },

    { id: mid('36'), name: '李明宇', gender: 'male', branch: '长房', generation: 5, birthDate: '2015-08-20', note: '李思远之子', createdAt: now, updatedAt: now },
    { id: mid('37'), name: '李欣妍', gender: 'female', branch: '长房', generation: 5, birthDate: '2018-03-10', note: '李思远之女', createdAt: now, updatedAt: now },
    { id: mid('38'), name: '李明哲', gender: 'male', branch: '三房', generation: 5, birthDate: '2020-12-25', note: '李浩然之子', createdAt: now, updatedAt: now },
  ],
  relationships: [
    { id: rid('1'), fromId: mid('1'), toId: mid('2'), type: 'spouse', createdAt: now },
    { id: rid('2'), fromId: mid('2'), toId: mid('1'), type: 'spouse', createdAt: now },

    { id: rid('3'), fromId: mid('1'), toId: mid('3'), type: 'parent', createdAt: now },
    { id: rid('4'), fromId: mid('3'), toId: mid('1'), type: 'child', createdAt: now },
    { id: rid('5'), fromId: mid('2'), toId: mid('3'), type: 'parent', createdAt: now },
    { id: rid('6'), fromId: mid('3'), toId: mid('2'), type: 'child', createdAt: now },

    { id: rid('7'), fromId: mid('1'), toId: mid('5'), type: 'parent', createdAt: now },
    { id: rid('8'), fromId: mid('5'), toId: mid('1'), type: 'child', createdAt: now },
    { id: rid('9'), fromId: mid('2'), toId: mid('5'), type: 'parent', createdAt: now },
    { id: rid('10'), fromId: mid('5'), toId: mid('2'), type: 'child', createdAt: now },

    { id: rid('11'), fromId: mid('1'), toId: mid('7'), type: 'parent', createdAt: now },
    { id: rid('12'), fromId: mid('7'), toId: mid('1'), type: 'child', createdAt: now },
    { id: rid('13'), fromId: mid('2'), toId: mid('7'), type: 'parent', createdAt: now },
    { id: rid('14'), fromId: mid('7'), toId: mid('2'), type: 'child', createdAt: now },

    { id: rid('15'), fromId: mid('1'), toId: mid('9'), type: 'parent', createdAt: now },
    { id: rid('16'), fromId: mid('9'), toId: mid('1'), type: 'child', createdAt: now },
    { id: rid('17'), fromId: mid('2'), toId: mid('9'), type: 'parent', createdAt: now },
    { id: rid('18'), fromId: mid('9'), toId: mid('2'), type: 'child', createdAt: now },

    { id: rid('19'), fromId: mid('3'), toId: mid('4'), type: 'spouse', createdAt: now },
    { id: rid('20'), fromId: mid('4'), toId: mid('3'), type: 'spouse', createdAt: now },
    { id: rid('21'), fromId: mid('5'), toId: mid('6'), type: 'spouse', createdAt: now },
    { id: rid('22'), fromId: mid('6'), toId: mid('5'), type: 'spouse', createdAt: now },
    { id: rid('23'), fromId: mid('7'), toId: mid('8'), type: 'spouse', createdAt: now },
    { id: rid('24'), fromId: mid('8'), toId: mid('7'), type: 'spouse', createdAt: now },
    { id: rid('25'), fromId: mid('9'), toId: mid('10'), type: 'spouse', createdAt: now },
    { id: rid('26'), fromId: mid('10'), toId: mid('9'), type: 'spouse', createdAt: now },

    { id: rid('27'), fromId: mid('3'), toId: mid('11'), type: 'parent', createdAt: now },
    { id: rid('28'), fromId: mid('11'), toId: mid('3'), type: 'child', createdAt: now },
    { id: rid('29'), fromId: mid('4'), toId: mid('11'), type: 'parent', createdAt: now },
    { id: rid('30'), fromId: mid('11'), toId: mid('4'), type: 'child', createdAt: now },

    { id: rid('31'), fromId: mid('3'), toId: mid('13'), type: 'parent', createdAt: now },
    { id: rid('32'), fromId: mid('13'), toId: mid('3'), type: 'child', createdAt: now },
    { id: rid('33'), fromId: mid('4'), toId: mid('13'), type: 'parent', createdAt: now },
    { id: rid('34'), fromId: mid('13'), toId: mid('4'), type: 'child', createdAt: now },

    { id: rid('35'), fromId: mid('3'), toId: mid('14'), type: 'parent', createdAt: now },
    { id: rid('36'), fromId: mid('14'), toId: mid('3'), type: 'child', createdAt: now },
    { id: rid('37'), fromId: mid('4'), toId: mid('14'), type: 'parent', createdAt: now },
    { id: rid('38'), fromId: mid('14'), toId: mid('4'), type: 'child', createdAt: now },

    { id: rid('39'), fromId: mid('11'), toId: mid('12'), type: 'spouse', createdAt: now },
    { id: rid('40'), fromId: mid('12'), toId: mid('11'), type: 'spouse', createdAt: now },
    { id: rid('41'), fromId: mid('14'), toId: mid('15'), type: 'spouse', createdAt: now },
    { id: rid('42'), fromId: mid('15'), toId: mid('14'), type: 'spouse', createdAt: now },

    { id: rid('43'), fromId: mid('5'), toId: mid('16'), type: 'parent', createdAt: now },
    { id: rid('44'), fromId: mid('16'), toId: mid('5'), type: 'child', createdAt: now },
    { id: rid('45'), fromId: mid('6'), toId: mid('16'), type: 'parent', createdAt: now },
    { id: rid('46'), fromId: mid('16'), toId: mid('6'), type: 'child', createdAt: now },

    { id: rid('47'), fromId: mid('5'), toId: mid('18'), type: 'parent', createdAt: now },
    { id: rid('48'), fromId: mid('18'), toId: mid('5'), type: 'child', createdAt: now },
    { id: rid('49'), fromId: mid('6'), toId: mid('18'), type: 'parent', createdAt: now },
    { id: rid('50'), fromId: mid('18'), toId: mid('6'), type: 'child', createdAt: now },

    { id: rid('51'), fromId: mid('16'), toId: mid('17'), type: 'spouse', createdAt: now },
    { id: rid('52'), fromId: mid('17'), toId: mid('16'), type: 'spouse', createdAt: now },

    { id: rid('53'), fromId: mid('7'), toId: mid('19'), type: 'parent', createdAt: now },
    { id: rid('54'), fromId: mid('19'), toId: mid('7'), type: 'child', createdAt: now },
    { id: rid('55'), fromId: mid('8'), toId: mid('19'), type: 'parent', createdAt: now },
    { id: rid('56'), fromId: mid('19'), toId: mid('8'), type: 'child', createdAt: now },

    { id: rid('57'), fromId: mid('7'), toId: mid('21'), type: 'parent', createdAt: now },
    { id: rid('58'), fromId: mid('21'), toId: mid('7'), type: 'child', createdAt: now },
    { id: rid('59'), fromId: mid('8'), toId: mid('21'), type: 'parent', createdAt: now },
    { id: rid('60'), fromId: mid('21'), toId: mid('8'), type: 'child', createdAt: now },

    { id: rid('61'), fromId: mid('19'), toId: mid('20'), type: 'spouse', createdAt: now },
    { id: rid('62'), fromId: mid('20'), toId: mid('19'), type: 'spouse', createdAt: now },

    { id: rid('63'), fromId: mid('9'), toId: mid('22'), type: 'parent', createdAt: now },
    { id: rid('64'), fromId: mid('22'), toId: mid('9'), type: 'child', createdAt: now },
    { id: rid('65'), fromId: mid('10'), toId: mid('22'), type: 'parent', createdAt: now },
    { id: rid('66'), fromId: mid('22'), toId: mid('10'), type: 'child', createdAt: now },

    { id: rid('67'), fromId: mid('9'), toId: mid('24'), type: 'parent', createdAt: now },
    { id: rid('68'), fromId: mid('24'), toId: mid('9'), type: 'child', createdAt: now },
    { id: rid('69'), fromId: mid('10'), toId: mid('24'), type: 'parent', createdAt: now },
    { id: rid('70'), fromId: mid('24'), toId: mid('10'), type: 'child', createdAt: now },

    { id: rid('71'), fromId: mid('22'), toId: mid('23'), type: 'spouse', createdAt: now },
    { id: rid('72'), fromId: mid('23'), toId: mid('22'), type: 'spouse', createdAt: now },

    { id: rid('73'), fromId: mid('11'), toId: mid('25'), type: 'parent', createdAt: now },
    { id: rid('74'), fromId: mid('25'), toId: mid('11'), type: 'child', createdAt: now },
    { id: rid('75'), fromId: mid('12'), toId: mid('25'), type: 'parent', createdAt: now },
    { id: rid('76'), fromId: mid('25'), toId: mid('12'), type: 'child', createdAt: now },

    { id: rid('77'), fromId: mid('11'), toId: mid('27'), type: 'parent', createdAt: now },
    { id: rid('78'), fromId: mid('27'), toId: mid('11'), type: 'child', createdAt: now },
    { id: rid('79'), fromId: mid('12'), toId: mid('27'), type: 'parent', createdAt: now },
    { id: rid('80'), fromId: mid('27'), toId: mid('12'), type: 'child', createdAt: now },

    { id: rid('81'), fromId: mid('14'), toId: mid('28'), type: 'parent', createdAt: now },
    { id: rid('82'), fromId: mid('28'), toId: mid('14'), type: 'child', createdAt: now },
    { id: rid('83'), fromId: mid('15'), toId: mid('28'), type: 'parent', createdAt: now },
    { id: rid('84'), fromId: mid('28'), toId: mid('15'), type: 'child', createdAt: now },

    { id: rid('85'), fromId: mid('25'), toId: mid('26'), type: 'spouse', createdAt: now },
    { id: rid('86'), fromId: mid('26'), toId: mid('25'), type: 'spouse', createdAt: now },

    { id: rid('87'), fromId: mid('16'), toId: mid('29'), type: 'parent', createdAt: now },
    { id: rid('88'), fromId: mid('29'), toId: mid('16'), type: 'child', createdAt: now },
    { id: rid('89'), fromId: mid('17'), toId: mid('29'), type: 'parent', createdAt: now },
    { id: rid('90'), fromId: mid('29'), toId: mid('17'), type: 'child', createdAt: now },

    { id: rid('91'), fromId: mid('16'), toId: mid('30'), type: 'parent', createdAt: now },
    { id: rid('92'), fromId: mid('30'), toId: mid('16'), type: 'child', createdAt: now },
    { id: rid('93'), fromId: mid('17'), toId: mid('30'), type: 'parent', createdAt: now },
    { id: rid('94'), fromId: mid('30'), toId: mid('17'), type: 'child', createdAt: now },

    { id: rid('95'), fromId: mid('19'), toId: mid('31'), type: 'parent', createdAt: now },
    { id: rid('96'), fromId: mid('31'), toId: mid('19'), type: 'child', createdAt: now },
    { id: rid('97'), fromId: mid('20'), toId: mid('31'), type: 'parent', createdAt: now },
    { id: rid('98'), fromId: mid('31'), toId: mid('20'), type: 'child', createdAt: now },

    { id: rid('99'), fromId: mid('19'), toId: mid('33'), type: 'parent', createdAt: now },
    { id: rid('100'), fromId: mid('33'), toId: mid('19'), type: 'child', createdAt: now },
    { id: rid('101'), fromId: mid('20'), toId: mid('33'), type: 'parent', createdAt: now },
    { id: rid('102'), fromId: mid('33'), toId: mid('20'), type: 'child', createdAt: now },

    { id: rid('103'), fromId: mid('31'), toId: mid('32'), type: 'spouse', createdAt: now },
    { id: rid('104'), fromId: mid('32'), toId: mid('31'), type: 'spouse', createdAt: now },

    { id: rid('105'), fromId: mid('22'), toId: mid('34'), type: 'parent', createdAt: now },
    { id: rid('106'), fromId: mid('34'), toId: mid('22'), type: 'child', createdAt: now },
    { id: rid('107'), fromId: mid('23'), toId: mid('34'), type: 'parent', createdAt: now },
    { id: rid('108'), fromId: mid('34'), toId: mid('23'), type: 'child', createdAt: now },

    { id: rid('109'), fromId: mid('22'), toId: mid('35'), type: 'parent', createdAt: now },
    { id: rid('110'), fromId: mid('35'), toId: mid('22'), type: 'child', createdAt: now },
    { id: rid('111'), fromId: mid('23'), toId: mid('35'), type: 'parent', createdAt: now },
    { id: rid('112'), fromId: mid('35'), toId: mid('23'), type: 'child', createdAt: now },

    { id: rid('113'), fromId: mid('25'), toId: mid('36'), type: 'parent', createdAt: now },
    { id: rid('114'), fromId: mid('36'), toId: mid('25'), type: 'child', createdAt: now },
    { id: rid('115'), fromId: mid('26'), toId: mid('36'), type: 'parent', createdAt: now },
    { id: rid('116'), fromId: mid('36'), toId: mid('26'), type: 'child', createdAt: now },

    { id: rid('117'), fromId: mid('25'), toId: mid('37'), type: 'parent', createdAt: now },
    { id: rid('118'), fromId: mid('37'), toId: mid('25'), type: 'child', createdAt: now },
    { id: rid('119'), fromId: mid('26'), toId: mid('37'), type: 'parent', createdAt: now },
    { id: rid('120'), fromId: mid('37'), toId: mid('26'), type: 'child', createdAt: now },

    { id: rid('121'), fromId: mid('31'), toId: mid('38'), type: 'parent', createdAt: now },
    { id: rid('122'), fromId: mid('38'), toId: mid('31'), type: 'child', createdAt: now },
    { id: rid('123'), fromId: mid('32'), toId: mid('38'), type: 'parent', createdAt: now },
    { id: rid('124'), fromId: mid('38'), toId: mid('32'), type: 'child', createdAt: now },
  ],
};

export function getSampleData() {
  return sampleFamilyData;
}
