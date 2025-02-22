//data module do modulo de usuário, responsável por guardar os dados de usuários e manipular os dados armazenados
import { Injectable } from "@nestjs/common";
import { UsuarioEntity } from "./usuario.entity";
import { alteraUsuarioDTO } from "./dto/alteraUsuario.dto";

//Decorator responsável por informar que essa classe pode ser injetada em outras classes, podendo assim ser administrada pelo modulo
@Injectable()
export class UsuariosArmazenados{
    //Criação de vetor para armazenar os usuários (apenas em memoria, quando reiniciar a API perde tudo)
    #usuarios: UsuarioEntity[] = [];  

    //funçaço responsável por guardar o usuário no vetor
    AdicionarUsuario(usuario: UsuarioEntity){
        this.#usuarios.push(usuario);
    }


    //função resposável por pesquisar usuários que tenham o email especificado 
    pesquisaEmail(email:string){

        //função find procura no vetor os dados com base no que foi especificado na função de parada( usuario.email = email)
        const possivelUsuario = this.#usuarios.find(
            usuario => usuario.email == email
        )
        return possivelUsuario;
    }    

    //função responsável por pesquisar usuário que tenham o ID especificado
    pesquisaId(id:string){
        const possivelUsuario = this.#usuarios.find(
            usuarioSalvo => usuarioSalvo.id === id
        );

        if(!possivelUsuario){
            throw new Error('Usuario não encontrado');//cria um erro quando o usuário não é encontrado
        }

        return possivelUsuario
    }

    //função responsável por alterar o usuário
    alteraUsuario(id:string,dadosNovos: alteraUsuarioDTO){
        //pesquisa o usuário que vai ser alterado
        const usuario = this.pesquisaId(id);

        //aqui os dados que são recebidos no JSon são convertidos para uma tabela de chave e valor, para isolar os dados recebidos
        Object.entries(dadosNovos).forEach(
            ([chave,valor]) => {
                //aqui é validado se o campo a ser alterado vai ser o ID, se for ele ignora, pois não se pode alterar o ID
                if(chave === 'id'){
                    return
                }

                //caso não seja nenhum campo especial, é feito só a alteração direta do valor do campo com base no valor passado 
                usuario[chave] = valor;
            }
        )

        return usuario;
        
    }

    //função para validar se o email passado ja existe em outro usuário, é usada em geral para o email unico validator
    validaEmail(emailNovo: string){
        const possivelUsuario = this.pesquisaEmail(emailNovo)
        
        return (possivelUsuario === undefined)
    }

    //função responsável por fazer a validação de login
    Login(email:string ,senha:string){
        //primeiro é pesquisado o usuário por meio do email
        const possivelUsuario = this.pesquisaEmail(email)
        //caso encontre o usuário é validada então a senha, caso contrário ja retorna erro de login
        if (possivelUsuario){
            return {
                //aqui é validada a senha, caso a senha esteja correta, é retornado os dados do usuário e também o status (true para correto, false para incorreto)
                usuario: possivelUsuario.senha == senha?possivelUsuario:null,
                status: possivelUsuario.senha == senha
            };
        }else{
            return {
                usuario: null,
                status: false
            };
        }

    }
    async removeUsuario(id: string){
        const usuario = this.pesquisaId(id);

        this.#usuarios = this.#usuarios.filter(
                            usuarioSalvo => usuarioSalvo.id !== id
                            )

        return usuario
    }

    
    //função para retornar todos os usuarios
    get Usuarios(){        
        return this.#usuarios;
    }
}