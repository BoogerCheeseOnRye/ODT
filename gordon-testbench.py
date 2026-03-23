#!/usr/bin/env python3
"""
TEoAAAG Dashboard Testbench - Gordon Automated Testing Suite
Runs automated tests against the dashboard and generates benchmark data
"""

import os
import sys
import json
import time
import subprocess
from datetime import datetime
from pathlib import Path

class GordonTestbench:
    def __init__(self):
        self.dashboard_url = os.getenv('DASHBOARD_URL', 'http://localhost:3000')
        self.results_dir = Path(os.getenv('TEST_OUTPUT_DIR', './testbench-results'))
        self.results_dir.mkdir(exist_ok=True)
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'dashboard_url': self.dashboard_url,
            'tests': [],
            'metrics': {},
            'errors': []
        }

    def log(self, message, level='INFO'):
        """Log test messages"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] [{level}] {message}")

    def test_dashboard_accessibility(self):
        """Test 1: Dashboard is accessible"""
        self.log("Testing dashboard accessibility...", "TEST")
        try:
            result = subprocess.run(
                ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', self.dashboard_url],
                capture_output=True,
                text=True,
                timeout=5
            )
            http_code = result.stdout.strip()
            
            test = {
                'name': 'Dashboard Accessibility',
                'status': 'PASS' if http_code == '200' else 'FAIL',
                'http_code': http_code,
                'url': self.dashboard_url,
                'timestamp': datetime.now().isoformat()
            }
            self.results['tests'].append(test)
            self.log(f"✓ Dashboard HTTP {http_code}", "PASS")
            return http_code == '200'
        except Exception as e:
            self.log(f"✗ Accessibility test failed: {str(e)}", "FAIL")
            self.results['errors'].append({
                'test': 'accessibility',
                'error': str(e)
            })
            return False

    def test_html_structure(self):
        """Test 2: HTML structure and elements"""
        self.log("Testing HTML structure...", "TEST")
        try:
            result = subprocess.run(
                ['curl', '-s', self.dashboard_url],
                capture_output=True,
                text=True,
                timeout=10
            )
            html = result.stdout
            
            required_elements = [
                '<div class="container">',
                'id="chat-input"',
                'id="preview3d"',
                'id="file-tree"',
                '<canvas id="preview3d">',
                'THREE.js',
                'Model Manager',
                'Settings'
            ]
            
            test = {
                'name': 'HTML Structure',
                'status': 'PASS',
                'elements_found': 0,
                'elements_total': len(required_elements),
                'missing_elements': []
            }
            
            for element in required_elements:
                if element in html:
                    test['elements_found'] += 1
                else:
                    test['missing_elements'].append(element)
            
            test['status'] = 'PASS' if test['elements_found'] == test['elements_total'] else 'WARN'
            self.results['tests'].append(test)
            self.log(f"✓ Found {test['elements_found']}/{test['elements_total']} required elements", "PASS")
            return True
        except Exception as e:
            self.log(f"✗ HTML structure test failed: {str(e)}", "FAIL")
            self.results['errors'].append({'test': 'html_structure', 'error': str(e)})
            return False

    def test_javascript_features(self):
        """Test 3: JavaScript features present"""
        self.log("Testing JavaScript features...", "TEST")
        try:
            result = subprocess.run(
                ['curl', '-s', self.dashboard_url],
                capture_output=True,
                text=True,
                timeout=10
            )
            html = result.stdout
            
            js_features = [
                'function init3D()',
                'function sendChat()',
                'function toggleFullscreen()',
                'function openModelsModal()',
                'function loadProjects()',
                'IndexedDB',
                'WebGL',
                'requestAnimationFrame'
            ]
            
            test = {
                'name': 'JavaScript Features',
                'features_found': 0,
                'features_total': len(js_features),
                'features': {}
            }
            
            for feature in js_features:
                present = feature in html
                test['features'][feature] = present
                if present:
                    test['features_found'] += 1
            
            test['status'] = 'PASS' if test['features_found'] == test['features_total'] else 'WARN'
            self.results['tests'].append(test)
            self.log(f"✓ Found {test['features_found']}/{test['features_total']} JS features", "PASS")
            return True
        except Exception as e:
            self.log(f"✗ JS features test failed: {str(e)}", "FAIL")
            self.results['errors'].append({'test': 'js_features', 'error': str(e)})
            return False

    def test_performance_metrics(self):
        """Test 4: Performance baseline"""
        self.log("Measuring performance metrics...", "TEST")
        try:
            metrics = {
                'response_times': [],
                'load_time_start': time.time()
            }
            
            # Multiple requests to get average
            for i in range(5):
                start = time.time()
                result = subprocess.run(
                    ['curl', '-s', '-o', '/dev/null', '-w', '%{time_total}', self.dashboard_url],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                elapsed = float(result.stdout.strip())
                metrics['response_times'].append(elapsed)
            
            metrics['load_time_end'] = time.time()
            
            test = {
                'name': 'Performance Metrics',
                'status': 'PASS',
                'avg_response_time': sum(metrics['response_times']) / len(metrics['response_times']),
                'min_response_time': min(metrics['response_times']),
                'max_response_time': max(metrics['response_times']),
                'requests': 5
            }
            
            self.results['tests'].append(test)
            self.results['metrics'] = test
            self.log(f"✓ Avg response: {test['avg_response_time']:.3f}s", "PASS")
            return True
        except Exception as e:
            self.log(f"✗ Performance test failed: {str(e)}", "FAIL")
            self.results['errors'].append({'test': 'performance', 'error': str(e)})
            return False

    def test_modal_structure(self):
        """Test 5: Modal components"""
        self.log("Testing modal structure...", "TEST")
        try:
            result = subprocess.run(
                ['curl', '-s', self.dashboard_url],
                capture_output=True,
                text=True,
                timeout=10
            )
            html = result.stdout
            
            modals = [
                'modelsModal',
                'settingsModal',
                'hardwareModal',
                'diagnosticsModal',
                'uiCustomizerModal',
                'pathsModal',
                'optimizeModal'
            ]
            
            test = {
                'name': 'Modal Components',
                'modals_found': 0,
                'modals': {}
            }
            
            for modal in modals:
                present = f'id="{modal}"' in html
                test['modals'][modal] = present
                if present:
                    test['modals_found'] += 1
            
            test['status'] = 'PASS' if test['modals_found'] == len(modals) else 'WARN'
            self.results['tests'].append(test)
            self.log(f"✓ Found {test['modals_found']}/{len(modals)} modals", "PASS")
            return True
        except Exception as e:
            self.log(f"✗ Modal test failed: {str(e)}", "FAIL")
            self.results['errors'].append({'test': 'modals', 'error': str(e)})
            return False

    def generate_report(self):
        """Generate test report"""
        self.log("Generating test report...", "INFO")
        
        report_file = self.results_dir / f"testbench-report-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        
        with open(report_file, 'w') as f:
            json.dump(self.results, f, indent=2)
        
        self.log(f"✓ Report saved: {report_file}", "INFO")
        
        # Also create a text summary
        summary_file = self.results_dir / f"testbench-summary-{datetime.now().strftime('%Y%m%d-%H%M%S')}.txt"
        
        with open(summary_file, 'w') as f:
            f.write("=" * 60 + "\n")
            f.write("TEoAAAG DASHBOARD TESTBENCH REPORT\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"Timestamp: {self.results['timestamp']}\n")
            f.write(f"Dashboard URL: {self.results['dashboard_url']}\n\n")
            
            passed = sum(1 for t in self.results['tests'] if t['status'] == 'PASS')
            warned = sum(1 for t in self.results['tests'] if t['status'] == 'WARN')
            failed = sum(1 for t in self.results['tests'] if t['status'] == 'FAIL')
            
            f.write(f"Test Results: {passed} PASS, {warned} WARN, {failed} FAIL\n\n")
            
            for test in self.results['tests']:
                f.write(f"[{test['status']}] {test['name']}\n")
                for key, value in test.items():
                    if key not in ['name', 'status']:
                        f.write(f"  {key}: {value}\n")
                f.write("\n")
            
            if self.results['errors']:
                f.write("\nErrors:\n")
                for error in self.results['errors']:
                    f.write(f"  {error}\n")
        
        self.log(f"✓ Summary saved: {summary_file}", "INFO")

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("=" * 60, "INFO")
        self.log("GORDON TESTBENCH - AUTOMATED DASHBOARD TESTING", "INFO")
        self.log("=" * 60, "INFO")
        self.log("")
        
        self.test_dashboard_accessibility()
        self.test_html_structure()
        self.test_javascript_features()
        self.test_performance_metrics()
        self.test_modal_structure()
        
        self.log("", "INFO")
        self.log("=" * 60, "INFO")
        
        self.generate_report()
        
        self.log("", "INFO")
        self.log("Testbench complete. Results saved to testbench-results/", "INFO")
        self.log("", "INFO")

if __name__ == '__main__':
    testbench = GordonTestbench()
    testbench.run_all_tests()
