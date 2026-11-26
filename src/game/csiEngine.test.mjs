import {createRequire} from 'node:module';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {assistanceLevel,recordAssistance,calculateCaseScore,preserveCaseTruth,calculateCaseReview}=require('../../api/_lib/csi.js');

test('brainstorming has no assistance level or XP deduction',()=>{
  assert.equal(assistanceLevel(0),null);
  const state=recordAssistance({csiAssistance:{gentle:0,directional:0,direct:0}},0);
  assert.deepEqual(state.csiAssistance,{gentle:0,directional:0,direct:0});
  assert.equal(calculateCaseScore({baseXp:100}).finalXp,100);
});

test('explicit hints are counted by severity',()=>{
  let state={};
  state=recordAssistance(state,1);
  state=recordAssistance(state,2);
  state=recordAssistance(state,3);
  assert.deepEqual(state.csiAssistance,{gentle:1,directional:1,direct:1});
  assert.equal(calculateCaseScore({baseXp:300,assistance:state.csiAssistance}).finalXp,215);
});

test('case truth, timeline, facts and clue catalogue cannot be rewritten',()=>{
  const original={truth:'Bob did it',timeline:['20:00','21:00'],world:'Locked world',caseFile:{culprit:'Bob'},facts:['fact'],clues:[{id:'shoe',meaning:'Bob',discovered:false},{id:'watch',meaning:'time discrepancy',discovered:true}]};
  const proposed={truth:'Alice did it',timeline:['different'],world:'rewritten',caseFile:{culprit:'Alice'},facts:['invented'],clues:[{id:'shoe',meaning:'not Bob',discovered:true},{id:'watch',discovered:false},{id:'new',discovered:true}]};
  const result=preserveCaseTruth(original,proposed);
  assert.equal(result.truth,'Bob did it');
  assert.deepEqual(result.timeline,['20:00','21:00']);
  assert.equal(result.caseFile.culprit,'Bob');
  assert.deepEqual(result.facts,['fact']);
  assert.deepEqual(result.clues,[{id:'shoe',meaning:'Bob',discovered:true},{id:'watch',meaning:'time discrepancy',discovered:true}]);
});

test('case score never becomes negative',()=>{
  assert.equal(calculateCaseScore({baseXp:10,assistance:{direct:99}}).finalXp,0);
});

test('case review requires the sealed culprit and discovered evidence to solve',()=>{
  const state={caseFile:{culpritId:'suspect-b',evidenceCatalogue:[{id:'shoe'},{id:'glass'}]},clues:[{id:'shoe',discovered:true},{id:'unrelated',discovered:true}],csiAssistance:{gentle:1,directional:1,direct:0}};
  const solved=calculateCaseReview(state,'suspect-b','The shoe mark and timeline place the suspect at the scene.');
  assert.equal(solved.verdict,'CASE SOLVED');
  assert.equal(solved.verifiedEvidence,1);
  assert.equal(solved.xpDeducted,35);
  assert.equal(solved.xpAwarded,220);
  const unsupported=calculateCaseReview(state,'suspect-b','');
  assert.equal(unsupported.verdict,'CASE SOLVED');
  const wrong=calculateCaseReview(state,'suspect-a','A different theory.');
  assert.equal(wrong.verdict,'CASE UNRESOLVED');
  assert.equal(wrong.correctSuspectId,null);
});
