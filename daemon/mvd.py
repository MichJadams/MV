import cmd, sys

class MVShell(cmd.Cmd):
    intro = 'Welcome to the MV shell.   Type help or ? to list commands.\n'
    prompt = '> '

    
    def do_exit(self, arg):
        'Exit the MV shell'
        return True

    
    def do_sources(self, arg):
        'Manage sources'
        print(arg)
        return False
    def do_sources_test(self, arg):
        'Manage sources'
        print(arg)
        return False
    
def parse(arg):
    'Convert a series of zero or more numbers to an argument tuple'
    return tuple(map(int, arg.split()))

if __name__ == '__main__':
    MVShell().cmdloop()