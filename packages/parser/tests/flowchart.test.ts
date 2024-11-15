import { describe, expect, it } from 'vitest';

import { expectNoErrorsOrAlternatives, flowchartParse as parse } from './test-util.js';

describe('flowchart', () => {
  it.each([
    `flowchart`,
    `  flowchart  `,
    `\tflowchart\t`,
    `
    \tflowchart
    `,
  ])('should handle regular flowchart', (context: string) => {
    const result = parse(context);
    expectNoErrorsOrAlternatives(result);
    expect(result.value.type).toBe('flowchart');
  });

  it.each([
    // TB
    'TB',
    'v',
    'TD',
    // LR
    'LR',
    '<',
    // RL
    'RL',
    '>',
    // BT
    'BT',
    '^',
  ])('should handle direction', (context: string) => {
    const result = parse(`flowchart ${context}`);
    expectNoErrorsOrAlternatives(result);
    expect(result.value.dir).toBe(context);
  });

  it.each([`flowchart`, `graph`, `flowchart-elk`])(
    'should handle flowchart types',
    (context: string) => {
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.type).toBe(context);
    }
  );

  it.each([`flowchart ; A`, `flowchart\nA`, `flowchart;A`, `flowchart;\nA`])(
    'should handle delimiters',
    (context: string) => {
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
    }
  );

  it.each([`flowchart\n%% comment\nA`, `flowchart\n \t%% comment\nA`, `flowchart\nA%% comment`])(
    'should handle comments',
    (context: string) => {
      const result = parse(context);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.nodes[0].id).toBe('A');
    }
  );

  describe('nodes', () => {
    it.each([
      '.',
      'Start 103a.a1',
      '_',
      ':',
      ',',
      'a-b',
      '+',
      '*',
      '<',
      '&lt;',
      '>',
      '&gt;',
      '=',
      '&equals;',
      '&',
    ])('should handle special characters in labels', (context: string) => {
      const result = parse(`flowchart;A(${context})-->B;`);
      expectNoErrorsOrAlternatives(result);
    });

    it.each([
      ['[a]', 'FlowchartNodeSquare'],
      ['(a)', 'FlowchartNodeRound'],
      ['{a}', 'FlowchartNodeDiamond'],
      ['(-a-)', 'FlowchartNodeEllipse'],
      ['([a])', 'FlowchartNodeStadium'],
      ['>a]', 'FlowchartNodeOdd'],
      ['[(a)]', 'FlowchartNodeCylinder'],
      ['(((a)))', 'FlowchartNodeDoublecircle'],
      ['[/a\\]', 'FlowchartNodeTrapezoid'],
      ['[\\a/]', 'FlowchartNodeInvTrapezoid'],
      ['[/a/]', 'FlowchartNodeLeanRight'],
      ['[\\a\\]', 'FlowchartNodeLeanLeft'],
      ['[[a]]', 'FlowchartNodeSubroutine'],
      ['{{a}}', 'FlowchartNodeHexagon'],
    ])('should handle shapes', (context: string, nodeType: string) => {
      const result = parse(`flowchart;A${context};`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.nodes).toHaveLength(1);
      expect(result.value.nodes[0].id).toBe('A');
      expect(result.value.nodes[0].label).toBe('a');
      expect(result.value.nodes[0].$type).toBe(nodeType);
    });

    it.each([
      ['[a]', 'FlowchartNodeSquare'],
      ['(a)', 'FlowchartNodeRound'],
      ['{a}', 'FlowchartNodeDiamond'],
      ['(-a-)', 'FlowchartNodeEllipse'],
      ['([a])', 'FlowchartNodeStadium'],
      ['>a]', 'FlowchartNodeOdd'],
      ['[(a)]', 'FlowchartNodeCylinder'],
      ['(((a)))', 'FlowchartNodeDoublecircle'],
      ['[/a\\]', 'FlowchartNodeTrapezoid'],
      ['[\\a/]', 'FlowchartNodeInvTrapezoid'],
      ['[/a/]', 'FlowchartNodeLeanRight'],
      ['[\\a\\]', 'FlowchartNodeLeanLeft'],
      ['[[a]]', 'FlowchartNodeSubroutine'],
      ['{{a}}', 'FlowchartNodeHexagon'],
    ])('should handle classes', (context: string, _nodeType: string) => {
      const result = parse(`flowchart;A${context}:::test;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.nodes).toHaveLength(1);
      expect(result.value.nodes[0].id).toBe('A');
      expect(result.value.nodes[0].class).toBe('test');
    });
  });

  describe('edges', () => {
    it.each([
      ['-->', 'FlowchartEdgeRegular', undefined],
      ['-->|a|', 'FlowchartEdgeRegular', 'a'],
      ['-.->', 'FlowchartEdgeDotted', undefined],
      ['-.->|a|', 'FlowchartEdgeDotted', 'a'],
      ['==>', 'FlowchartEdgeThick', undefined],
      ['==>|a|', 'FlowchartEdgeThick', 'a'],
      ['~~~', 'FlowchartEdgeInvisible', undefined],
      ['~~~|a|', 'FlowchartEdgeInvisible', 'a'],
    ])('should handle edge labels', (context: string, edgeType: string, label?: string) => {
      const result = parse(`flowchart;A ${context} B;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges).toHaveLength(1);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
      expect(result.value.edges[0].ends[0].$type).toBe(edgeType);
      expect(result.value.edges[0].ends[0].label).toBe(label);
    });

    it.each([
      '---',
      '-->',
      '--x',
      '--o',
      '<--',
      'x--',
      'o--',
      '<-->',
      '===',
      '==>',
      '==x',
      '==o',
      '<==',
      'x==',
      'o==',
      '<==>',
      '-.-',
      '-.->',
      '-.-x',
      '-.-o',
      '<-.-',
      'x-.-',
      'o-.-',
      '<-.->',
      '.-',
      '<.-',
      '.->',
    ])('should handle arrow end and start types', (context: string) => {
      const result = parse(`flowchart;A ${context} B;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges).toHaveLength(1);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
    });

    it.each([
      '---',
      '----',
      '-----',
      '-->',
      '--->',
      '---->',
      '===',
      '====',
      '=====',
      '==>',
      '===>',
      '====>',
      '-.-',
      '-..-',
      '-...-',
      '-.->',
      '-..->',
      '-...->',
    ])('should handle arrow lengths', (context: string) => {
      const result = parse(`flowchart;A ${context} B;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges).toHaveLength(1);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
    });

    it.each([
      '--a---',
      '--a-->',
      '<--a-->',
      '<--a---', // 👈 this one doesn't work in playground
      '==a===',
      '==a==>',
      '<==a==>',
      '<==a===', // 👈 this one doesn't work in playground
      '-.a.-',
      '-.a.->',
      '<-.a.-',
    ])('should handle arrow labels', (context: string) => {
      const result = parse(`flowchart;A ${context} B;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges).toHaveLength(1);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
    });
  });

  describe('subgraph', () => {
    it('basic', () => {
      const result = parse(`flowchart; subgraph A; end`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.subgraphs).toHaveLength(1);
      expect(result.value.subgraphs[0].id).toBe('A');
    });

    it('direction', () => {
      const result = parse(`flowchart; subgraph A; direction TD; end`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.subgraphs).toHaveLength(1);
      expect(result.value.subgraphs[0].id).toBe('A');
      expect(result.value.subgraphs[0].dir).toBe('TD');
    });

    it('nodes', () => {
      const result = parse(`flowchart; subgraph A; X; end`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.subgraphs).toHaveLength(1);
      expect(result.value.subgraphs[0].id).toBe('A');
      expect(result.value.subgraphs[0].nodes[0].id).toBe('X');
    });

    it('edges', () => {
      const result = parse(`flowchart; subgraph A; X --> Y; end`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.subgraphs).toHaveLength(1);
      expect(result.value.subgraphs[0].id).toBe('A');
      expect(result.value.subgraphs[0].edges[0].start.id).toBe('X');
      expect(result.value.subgraphs[0].edges[0].ends[0].end.id).toBe('Y');
    });

    it('subgraphs', () => {
      const result = parse(`flowchart; subgraph A; subgraph B; end; end`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.subgraphs).toHaveLength(1);
      expect(result.value.subgraphs[0].id).toBe('A');
      expect(result.value.subgraphs[0].subgraphs[0].id).toBe('B');
    });
  });

  describe('style', () => {
    it.each(['style A background:#fff', 'style A background:#fff,border:1px solid red'])(
      'should handle styles',
      (context: string) => {
        const result = parse(`flowchart;${context}`);
        expectNoErrorsOrAlternatives(result);
        expect(result.value.styles).toHaveLength(1);
        expect(result.value.styles[0].id).toBe('A');
      }
    );
  });

  describe('interaction', () => {
    it.each([
      'click A "click.html"',
      'click A "click.html" "tooltip"',
      'click A "click.html" _blank',
      'click A "click.html" "tooltip" _blank',
      'click A href "click.html" "tooltip" _blank',
    ])('should handle links', (context: string) => {
      const result = parse(`flowchart;${context}`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.interactions).toHaveLength(1);
      expect(result.value.interactions[0].id).toBe('A');
      expect(result.value.interactions[0].href).toBe('click.html');
    });

    it.each([
      'click A callback',
      'click A callback "tooltip"',
      'click A call callback("test0", test1, test2)',
      'click A call callback("test0", test1, test2) "tooltip"',
    ])('should handle callbacks', (context: string) => {
      const result = parse(`flowchart;${context}`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.interactions).toHaveLength(1);
      expect(result.value.interactions[0].id).toBe('A');
      expect(result.value.interactions[0].callback).toBe('callback');
    });
  });

  describe('chaining', () => {
    it('should handle simple chaining', () => {
      const result = parse(`flowchart; A --> B --> C;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges[0].ends).toHaveLength(2);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
      expect(result.value.edges[0].ends[1].end.id).toBe('C');
    });

    it('should handle chaining with labels', () => {
      const result = parse(`flowchart; A -- text --> B -- text2 --> C;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges[0].ends).toHaveLength(2);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
      expect(result.value.edges[0].ends[0].arrow).toBe('-- text -->');
      expect(result.value.edges[0].ends[1].end.id).toBe('C');
      expect(result.value.edges[0].ends[1].arrow).toBe('-- text2 -->');
    });

    it('should handle chaining with different edges', () => {
      const result = parse(`flowchart; A --> B ==> C -.-> D;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges[0].ends).toHaveLength(3);
      expect(result.value.edges[0].start.id).toBe('A');
      expect(result.value.edges[0].ends[0].end.id).toBe('B');
      expect(result.value.edges[0].ends[0].arrow).toBe('-->');
      expect(result.value.edges[0].ends[1].end.id).toBe('C');
      expect(result.value.edges[0].ends[1].arrow).toBe('==>');
      expect(result.value.edges[0].ends[2].end.id).toBe('D');
      expect(result.value.edges[0].ends[2].arrow).toBe('-.->');
    });
  });

  describe('conjunction', () => {
    it('should handle nodes conjunction', () => {
      const result = parse(`flowchart; A & B --> C & D;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges).toHaveLength(1);
      expect(result.value.edges[0].start.nodes).toHaveLength(2);
      expect(result.value.edges[0].start.nodes[0].id).toBe('A');
      expect(result.value.edges[0].start.nodes[1].id).toBe('B');
      expect(result.value.edges[0].ends[0].end.nodes[0].id).toBe('C');
      expect(result.value.edges[0].ends[0].end.nodes[1].id).toBe('D');
    });

    it.skip('should handle edges conjunction', () => {
      const result = parse(`flowchart; A --> B & C --> D;`);
      expectNoErrorsOrAlternatives(result);
      expect(result.value.edges).toHaveLength(1);
      expect(result.value.edges[0].edges).toHaveLength(2);
    });
  });

  // TODO: string (current mermaid doesn't support escape chars), markdown string, html escapes
  // TODO: extract label, start, end and length from arrows
  // TODO: DIRECTIVE, YAML, TITLE, ACC_TITLE, ACC_DESCR
  // TODO: rename nodes to vertices
  // TODO: normalize direction 'v', 'TD' -> 'TB' etc.
  // TODO: cross-references for node ids (for renaming)
});