/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const assert = require('assert');
const ReportGeneratorV2 = require('../../../report/v2/report-generator.js');

/* eslint-env mocha */

describe('ReportGeneratorV2', () => {
  describe('#arithmeticMean', () => {
    it('should work for empty list', () => {
      assert.equal(ReportGeneratorV2.arithmeticMean([]), 0);
    });

    it('should work for equal weights', () => {
      assert.equal(ReportGeneratorV2.arithmeticMean([
        {score: 10, weight: 1},
        {score: 20, weight: 1},
        {score: 3, weight: 1}
      ]), 11);
    });

    it('should work for varying weights', () => {
      assert.equal(ReportGeneratorV2.arithmeticMean([
        {score: 10, weight: 2},
        {score: 0, weight: 7},
        {score: 20, weight: 1}
      ]), 4);
    });

    it('should work for missing values', () => {
      assert.equal(ReportGeneratorV2.arithmeticMean([
        {weight: 1},
        {score: 30, weight: 1},
        {weight: 1},
        {score: 100},
      ]), 10);
    });
  });

  describe('#generateReportJson', () => {
    it('should return categories', () => {
      const result = new ReportGeneratorV2().generateReportJson({
        categories: {
          'my-category': {name: 'My Category', audits: []},
          'my-other-category': {description: 'It is a nice category', audits: []},
        }
      }, {});

      assert.equal(result.categories.length, 2);
      assert.equal(result.categories[0].id, 'my-category');
      assert.equal(result.categories[0].name, 'My Category');
      assert.equal(result.categories[1].id, 'my-other-category');
      assert.equal(result.categories[1].description, 'It is a nice category');
    });

    it('should score the categories', () => {
      const auditResults = {
        'my-audit': {rawValue: 'you passed'},
        'my-boolean-audit': {score: true, extendedInfo: {}},
        'my-scored-audit': {score: 100},
        'my-failed-audit': {score: 20},
        'my-boolean-failed-audit': {score: false},
      };

      const result = new ReportGeneratorV2().generateReportJson({
        categories: {
          'my-category': {audits: [{id: 'my-audit'}]},
          'my-scored': {
            audits: [
              {id: 'my-boolean-audit', weight: 1},
              {id: 'my-scored-audit', weight: 1},
              {id: 'my-failed-audit', weight: 1},
              {id: 'my-boolean-failed-audit', weight: 1},
            ]
          },
        }
      }, auditResults);

      assert.equal(result.categories.length, 2);
      assert.equal(result.categories[0].score, 0);
      assert.equal(result.categories[1].score, 55);
    });
  });
});
