import { describe, test, expect } from 'vitest';
import { generateId, parseId } from './id-generator';
import type { DslKind } from '../types';

describe('id-generator', () => {
  describe('generateId', () => {
    test('generateId_kindとtypeを指定した場合_正しい形式のIDが生成されること', () => {
      // Given: kindとtypeを指定
      const kind: DslKind = 'cjm';
      const type = 'action';

      // When: IDを生成
      const id = generateId(kind, type);

      // Then: 正しい形式（kind:type:uuid）であること
      expect(id).toMatch(/^cjm:action:[0-9a-f-]{36}$/);
    });

    test('generateId_複数回呼び出した場合_異なるUUIDが生成されること', () => {
      // Given: 同じkindとtype
      const kind: DslKind = 'sbp';
      const type = 'task';

      // When: 複数回IDを生成
      const id1 = generateId(kind, type);
      const id2 = generateId(kind, type);

      // Then: 異なるIDであること
      expect(id1).not.toBe(id2);

      // Then: 両方とも正しい形式であること
      expect(id1).toMatch(/^sbp:task:[0-9a-f-]{36}$/);
      expect(id2).toMatch(/^sbp:task:[0-9a-f-]{36}$/);
    });
  });

  describe('parseId', () => {
    test('parseId_正しい形式のIDの場合_パース結果が返却されること', () => {
      // Given: 正しい形式のID
      const id = 'cjm:action:123e4567-e89b-12d3-a456-426614174000';

      // When: IDをパース
      const result = parseId(id);

      // Then: 正しくパースされること
      expect(result).toEqual({
        kind: 'cjm',
        type: 'action',
        uuid: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    test('parseId_不正な形式のIDの場合_nullが返却されること', () => {
      // Given: 不正な形式のID（コロンが2つ未満）
      const invalidId1 = 'cjm:action';

      // When: IDをパース
      const result1 = parseId(invalidId1);

      // Then: nullが返却されること
      expect(result1).toBeNull();

      // Given: 不正な形式のID（コロンが多すぎる）
      const invalidId2 = 'cjm:action:uuid:extra';

      // When: IDをパース
      const result2 = parseId(invalidId2);

      // Then: nullが返却されること
      expect(result2).toBeNull();
    });

    test('parseId_空文字列の場合_nullが返却されること', () => {
      // Given: 空文字列
      const emptyId = '';

      // When: IDをパース
      const result = parseId(emptyId);

      // Then: nullが返却されること
      expect(result).toBeNull();
    });
  });
});
