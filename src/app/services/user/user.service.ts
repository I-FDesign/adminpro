import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user.model';
import { SERVICES_URL } from '../../config/config';
import swal from 'sweetalert';

import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UploadFileService } from '../upload-file/upload-file.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  user: User;
  token: string;

  constructor( 
    private http: HttpClient, 
    public router: Router,
    public _uploadFileService: UploadFileService
  ) { 
    this.getStorage();
  }

  getStorage(){

    if(localStorage.getItem('token')){
      this.token = localStorage.getItem('token');
      if(localStorage.getItem('user')){
        this.user = JSON.parse(localStorage.getItem('user'));
      }
    }else{
      this.token = '';
      this.user = null;
    }

  }

  saveInStorage( id, token, user: User ){

    localStorage.setItem('id', id);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    this.user =  user;
    this.token = token;

  }

  createUser( user: User ){

    const url = SERVICES_URL + '/users';

    return this.http.post( url, user ).pipe(
      map( (resp: any) =>{
           return resp.user;
      })

    );

  }

  login( user: User ){
    
    const url = SERVICES_URL + '/login';

    return this.http.post( url, user ).pipe(
      map( (res: any) =>{
          
          this.saveInStorage( res.id, res.token, res.user );

          return true;

      })
    );

  }

  loginGoogle( token ){

    const url = SERVICES_URL + '/login/google';
    
    return this.http.post( url, { token } ).pipe(
      map( (res: any) =>{
        
        
        if(!res.ok){
          console.log(res.message);
          return false;
        }else{
          this.saveInStorage( res.id, res.token, res.user );
                    
          return true;
        }

      } )
    );

  }

  logout(){

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.router.navigate(['/login']);

  }

  updateUser( user: User ){
    let url = SERVICES_URL + '/users/' + this.user._id;
    url += '?token=' + this.token;
  
    return this.http.put( url, user ).pipe(
      map( (res: any) =>{

        const userDB: User = res.user;
        
        this.saveInStorage( userDB._id, this.token, userDB );
        swal('User updated correctly', userDB.name, 'success');

        return true;

      })
    );

  }

  updateImage( image: File ){

    this._uploadFileService.uploadFile( image, 'user', this.user._id )
      .then( (res: any) =>{
        
        swal('Image updated correctly', this.user.name, 'success');

        const imgUrl = res.model.img.split('/');
        const imgPath = imgUrl[imgUrl.length - 1];

        this.user.img = imgPath;

        this.saveInStorage( this.user._id, this.token, this.user );

      }).catch( err =>{

        console.log(err);

      } );

  }

}
