import unittest
import json
from src.app import app, executor

class TestCodeExecutor(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_health_check(self):
        """Test del endpoint de salud"""
        response = self.app.get('/health')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('timestamp', data)
        self.assertIn('supported_languages', data)

    def test_execute_python_code(self):
        """Test de ejecución de código Python"""
        test_data = {
            'code': 'print("Hello World")',
            'language': 'python'
        }
        
        response = self.app.post('/execute', 
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('Hello World', data['output'])

    def test_execute_javascript_code(self):
        """Test de ejecución de código JavaScript"""
        test_data = {
            'code': 'console.log("Hello from JS");',
            'language': 'javascript'
        }
        
        response = self.app.post('/execute',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('Hello from JS', data['output'])

    def test_invalid_language(self):
        """Test con lenguaje no soportado"""
        test_data = {
            'code': 'print("test")',
            'language': 'invalid_lang'
        }
        
        response = self.app.post('/execute',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('no soportado', data['error'])

    def test_empty_code(self):
        """Test con código vacío"""
        test_data = {
            'code': '',
            'language': 'python'
        }
        
        response = self.app.post('/execute',
                               data=json.dumps(test_data),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('vacío', data['error'])

    def test_get_languages(self):
        """Test del endpoint de lenguajes"""
        response = self.app.get('/languages')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertIn('languages', data)
        self.assertIn('python', data['languages'])

if __name__ == '__main__':
    unittest.main()
